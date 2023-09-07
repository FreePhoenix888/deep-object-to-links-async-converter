import ts from "typescript";
import { DeepClientInstance } from "@deep-foundation/deeplinks/imports/client";
import { debug } from "./debug.js";

export async function callClientHandler(
  options: CallClientHandlerOptions,
): Promise<any> {
  const log = debug(callClientHandler.name);
  log({ options });
  const { linkId, deep, args } = options;
  log({ linkId, deep, args });
  const code = await deep
    .select({
      in: {
        id: linkId,
      },
    })
    .then((result) => {
      const link = result.data[0];
      if (!link) throw new Error(`Unable to find SyncTextFile for ##${linkId}`);
      const code = link.value?.value;
      if (!code) throw new Error(`##${link.id} must have value`);
      return code;
    });
  log({ code });

  const functionExpressionString = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  }).outputText;
  log({ functionExpressionString });
  const fn: Function = eval(functionExpressionString);
  log({ fn });

  const result = await fn(args);
  log({ result });
  return result;
}

export interface CallClientHandlerOptions {
  deep: DeepClientInstance;
  linkId: number;
  args: Array<any>;
}
