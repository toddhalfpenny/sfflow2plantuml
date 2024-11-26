import * as vscode from "vscode";
import * as path from "path";
import { FlowPanel } from "./panels/FlowPanel";
import { parseFlow } from "salesforce-flow-visualiser";
import { Logger } from "./logger";

export function activate(context: vscode.ExtensionContext) {
  new Logger(vscode.window);
  let renderWebView = vscode.commands.registerCommand(
    "sfflowvisualiser.generateWebview",
    async (flowUri: vscode.Uri | undefined) => {
      // If no URI is sent via VsCode event, get the uri of the currently active document
      if (!flowUri) {
        flowUri = vscode.window.activeTextEditor?.document.uri;
      }
      generateWebView(flowUri, context, "mermaid");
    }
  );

  context.subscriptions.push(renderWebView);
}

async function generateWebView(
  flowFileUri: vscode.Uri | undefined,
  context: vscode.ExtensionContext,
  mode: any
) {
  // Check if a file is selected
  if (!flowFileUri) {
    vscode.window.showErrorMessage(
      "You need to select / open a Flow to render it :)"
    );
    return;
  }

  // Check if the selected XML file is a Flow
  const filePath = flowFileUri.fsPath;
  if (!filePath.endsWith(".flow-meta.xml")) {
    vscode.window.showErrorMessage("You can only render Flow metadatas :)");
    return;
  }

  // Request flow rendering
  try {
    Logger.log(`Prepare rendering of Flow ${path.basename(filePath)}...`);
    const parsedXmlRes = await getParsedXML(mode, flowFileUri, {
      wrapInMarkdown: false,
    });
    // If there is already a panel, close it (not ideal but... messy behavior if I don't do that ^^)
    if (FlowPanel.currentPanel) {
      FlowPanel.currentPanel.dispose();
    }
    // Render new panel
    FlowPanel.render(context.extensionUri, parsedXmlRes);
    Logger.log(`Rendered flow ${path.basename(filePath)}`);
  } catch (error) {
    Logger.log(`Render error:\n${JSON.stringify(error, null, 2)}`);
  }
}

async function getParsedXML(mode: any, flowFileUri: vscode.Uri, options: any) {
  return new Promise(async (resolve, reject) => {
    const document = await vscode.workspace.openTextDocument(flowFileUri);
    const xmlData = document.getText();
    try {
      const res = await parseFlow(xmlData as string, mode, options);
      resolve(res);
    } catch (error) {
      reject(error);
    }
  });
}

export function deactivate() {}
