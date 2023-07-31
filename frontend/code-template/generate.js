/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
import { generateTemplateFiles } from "generate-template-files";

generateTemplateFiles([
  {
    option: "Create a new node",
    defaultCase: "(kebabCase)",
    entry: {
      folderPath: "./code-template/new-node/",
    },
    stringReplacers: [
      {
        question: "Node name:",
        slot: "__name__",
      },
      {
        question: "Node label: (Displayed in the editor)",
        slot: "__label__",
      },
      {
        question: "Node description:",
        slot: "__description__",
      },
      {
        question: "Node vendor:",
        slot: "__vendor__",
      },
    ],
    output: {
        path: "./src/nodes/node-__name__(kebabCase)/",
        pathAndFileNameDefaultCase: '(kebabCase)',
    },
    onComplete: () => {
      console.log(`Node created! Don't forget to add it to the @/nodes/index.ts!`)
    }
  },
]);
