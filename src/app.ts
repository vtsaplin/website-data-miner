import express, { Request, Response } from 'express';
import puppeteer, {Page} from 'puppeteer';
import {autoScroll} from './utils';

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

async function evaluateExpressions(queryRequest: QueryRequest) {
  const browser = await puppeteer.launch();

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

  console.log('Rendering page ', page.url());

  const results = await Promise.all(queryRequest.expressions.map(async expression => {
    console.log('Evaluating expression: ', expression);
    const result = await page.$$eval(expression.from, (elements, select) => {
      const toPlainJson = (obj: any) => JSON.parse(JSON.stringify(obj));
      return elements.map((element: any) => {
        return select.reduce((values, attribute) => {
          if (element[attribute]) {
            if (typeof element[attribute] === 'function') {
              values[attribute] = toPlainJson(element[attribute]());
            } else {
              values[attribute] = toPlainJson(element[attribute]);
            }
          }
          return values;
        }, {} as any);
      });
    }, expression.select);
    return { [expression.as]: result };
  }));

  await browser.close();

  return results;
}

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
  res.status(200).send('Server is up and running!')
})

router.post('/query', async (req: Request, res: Response) => {
  console.log('Received request');
  res.status(200).json(await evaluateExpressions(req.body as QueryRequest))
  console.log('Sent response');
})

const app = express();
app.use(express.json());
app.use('/', router)

app.listen(3000, () => {
  console.log(`Server started at ${3000}`)
})
