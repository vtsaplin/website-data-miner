import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import {autoScroll} from './utils.js';
import {Command} from 'commander';
import inquirer from 'inquirer';

const DEFAULT_PORT = 3000;
const DEFAULT_HEADLESS = true;

type Expression = {
  select: string[];
  from: string;
  as: string;
}

type QueryRequest = {
  url: string;
  expressions: Expression[];
  viewportWidth?: number;
  viewportHeight?: number;
  autoScroll?: boolean;
}

function evaluateExpressions() {
  return (elements: any, select: any) => {
    const toPlainJson = (obj: any) => JSON.parse(JSON.stringify(obj));
    return elements.map((element: any) => {
      return select.reduce((values: any, attribute: any) => {
        if (element[attribute]) {
          if (typeof element[attribute] === 'function') {
            values[attribute] = toPlainJson(element[attribute]());
          } else {
            values[attribute] = toPlainJson(element[attribute]);
          }
        }
        return values;
      }, {});
    });
  };
}

async function handleQueryRequest(queryRequest: QueryRequest, headless: boolean) {
  const browser = await puppeteer.launch({headless});

  const page = await browser.newPage();
  await page.setViewport({
    width: queryRequest.viewportWidth ?? 1024,
    height: queryRequest.viewportHeight ?? 768,
    deviceScaleFactor: 1,
  });

  await page.goto(queryRequest.url);
  await page.waitForNetworkIdle()

  if (queryRequest.autoScroll) {
    await autoScroll(page);
  }

  console.log(`\nRendering page ${page.url()} in ${headless ? 'headless' : 'headed'} mode...`);

  const results = await Promise.all(queryRequest.expressions.map(async expression => {
    console.log('Evaluating expression: ', expression);
    const result = await page.$$eval(expression.from, evaluateExpressions(), expression.select);
    return { [expression.as]: result };
  }));

  await browser.close();

  return results;
}

function serve(port: number, headless: boolean) {
  const router = express.Router()

  router.get('/', (req: Request, res: Response) => {
    res.status(200).send('Server is up and running!')
  })

  router.post('/query', async (req: Request, res: Response) => {
    console.log('Received request');
    res.status(200).json(await handleQueryRequest(req.body as QueryRequest, headless))
    console.log('Sent response');
  })

  const app = express();
  app.use(express.json());
  app.use('/', router)

  app.listen(port, () => {
    console.log(`\nServer started at http://localhost:${port}...\n`);
  })
}

function getQuestions() {
  return [
    {
      type: 'input',
      name: 'port',
      message: 'What is the server port?',
      default: DEFAULT_PORT,
    },
    {
      type: 'confirm',
      name: 'headless',
      message: 'Do you want to run in headless mode?',
      default: DEFAULT_HEADLESS,
    }
  ];
}

async function main() {
  const args = new Command()
    .helpOption('-h, --help', 'Show help')
    .option('--no-prompt', 'No prompt')
    .option('--no-headless', 'Disable headless mode')
    .option('-p, --port <port>', 'Server port')
    .parse().opts();

  const options = args.prompt ? await inquirer.prompt(getQuestions()) : args;

  const port = options.port ?? DEFAULT_PORT;
  const headless = options.headless ?? DEFAULT_HEADLESS;

  serve(port, headless);
}

main().catch((err) => {
  console.error(err);
});
