import cheerio from 'cheerio';
import request from 'request-promise';

(async () => {
    
    request('https://24hmoney.vn/stock/TDM', (error, response, html) => {
      
        if(!error && response.statusCode == 200) {
            const $ = cheerio.load(html); // load HTML
            console.time('time');
            // $('.stock-prices-box-item .d-row').each((index, el) => { // lặp từng phần tử có class là job__list-item
            //     // const job = $(el).find('.d-row span').text(); // lấy tên job, được nằm trong thẻ a < .job__list-item-title
        
            //     console.log(el);
            //   })
            let prices: {
                label: string | null;
                price: string | null;
            }[] = [];
            const collections = $('.stock-prices-box');
            const nodes = collections.find('.d-row');
            nodes.each((i, el) => {
                const labelClass = $(el).find(".label");
                const labelName = labelClass!.text();
                const priceClass = $(el).find(".price");
                const price = priceClass!.text();
                prices.push({
                    label: labelName,
                    price: price
                });
            });

            console.log(prices);
            
            // collections.each((index, el) => { console.log(el) });
            // const nodes = collection.children('.d-row');
            // nodes.each(function() {
            //     console.log(this);
            // });
            // .each((index, el) => { // lặp từng phần tử có class là job__list-item

            //   console.log(nodes);
            // })
        }
        else {
            console.log(error);
        }
        console.timeEnd('time');
    })
})();