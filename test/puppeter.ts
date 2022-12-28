import puppeteer from 'puppeteer';

(async () => {
	console.time('time');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto('https://24hmoney.vn/stock/TDM');
	
    let data = await page.evaluate(() => {
		let prices: {
			label: string | null;
			price: string | null;
		}[] = [];
        let collections = document.getElementsByClassName("stock-prices-box") as unknown as HTMLElement[];
        let nodes = collections[0].querySelectorAll(".d-row");
        nodes.forEach((node) => {
			const labelClass = node.querySelector(".label");
			const labelName = labelClass!.textContent;
			const priceClass = node.querySelector(".price");
			const price = priceClass!.textContent;
			
			prices.push({
				label: labelName,
				price: price
			});
        });
        return prices;
    });
    
	console.log(data);
  
    await browser.close();
	console.timeEnd('time');
})();
