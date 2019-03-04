import * as vscode from "vscode";
import * as FindAlternate from "./FindAlternate";

const errorMessagePrefix = "Failed to parse .projections.json";

let commands: vscode.Disposable[] = [];

export const activate = async (
  context: vscode.ExtensionContext
): Promise<void> => {
  const registerCommandsWithContext = registerCommands(context);

  commands = await registerCommandsWithContext();
  const projectionsWatcher = vscode.workspace.createFileSystemWatcher(
    "**/.projections.json"
  );

  projectionsWatcher.onDidChange(registerCommandsWithContext);
  projectionsWatcher.onDidCreate(registerCommandsWithContext);
  projectionsWatcher.onDidDelete(registerEmptyCommands(context));
};

const deregisterCommands = () => {
  commands.forEach(command => command.dispose());
};

const registerCommands = (context: vscode.ExtensionContext) => async () => {
  deregisterCommands();

  try {
    commands = [
      vscode.commands.registerCommand(
        "alternate.alternateFile",
        FindAlternate.openFile({ split: false })
      ),
      vscode.commands.registerCommand(
        "alternate.alternateFileInSplit",
        FindAlternate.openFile({ split: true })
      ),
      vscode.commands.registerCommand(
        "alternate.createAlternateFile",
        FindAlternate.createFile({ split: false })
      ),
      vscode.commands.registerCommand(
        "alternate.createAlternateFileInSplit",
        FindAlternate.createFile({ split: true })
      )
    ];

    commands.forEach(command => context.subscriptions.push(command));

    console.log("updated .projections.json");

    return commands;
  } catch (e) {
    const message = e.message
      ? `${errorMessagePrefix}: ${e.message}`
      : errorMessagePrefix;
    vscode.window.showErrorMessage(message);
    registerEmptyCommands(context)();

    return [];
  }
};

const registerEmptyCommands = (context: vscode.ExtensionContext) => () => {
  deregisterCommands();

  commands = [
    vscode.commands.registerCommand(
      "alternate.alternateFile",
      showMissingProjectionsCommandError
    ),
    vscode.commands.registerCommand(
      "alternate.alternateFileInSplit",
      showMissingProjectionsCommandError
    ),
    vscode.commands.registerCommand(
      "alternate.createAlternateFile",
      showMissingProjectionsCommandError
    ),
    vscode.commands.registerCommand(
      "alternate.createAlternateFileInSplit",
      showMissingProjectionsCommandError
    )
  ];

  commands.forEach(command => context.subscriptions.push(command));
};

const showMissingProjectionsCommandError = () =>
  vscode.window.showErrorMessage(
    "Can't run command - please create a .projections.json first."
  );

export function deactivate() {}
