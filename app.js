let express = require('express');
let fs = require('fs');
let axios = require('axios');
let cheerio = require('cheerio');
let pdf = require('html-pdf');
let app = express();
let htm = fs.readFileSync('demo.html','utf8')
let page = cheerio.load(htm);

app.get('/arbitrage', async function(req,res){
    let stock = ['Infosys','TataSteel','AdaniPower','TataMotors','AdaniEnterprises'];
    let url = [
    'https://www.business-standard.com/company/infosys-2806.html',
    'https://www.business-standard.com/company/tata-steel-566.html',
    'https://www.business-standard.com/company/adani-power-17808.html',
    'https://www.business-standard.com/company/tata-motors-560.html',
    'https://www.business-standard.com/company/adani-enterp-4244.html'

]

    page = cheerio.load(htm);

    for(let u=0; u < url.length;u++){
        try{
                let response = await axios(url[u]);
                let html = response.data;
                let $ = cheerio.load(html);

                let values = [];
                $('.tdC').filter(function(){
                    let data = $(this);
                    values.push(parseFloat(data.text()))
                });


                page('.my_table').append(`
                <tr>
                    <td>${stock[u]}</td>
                    <td>${values[2]}</td>
                    <td>${values[0]}</td>
                    <td>${Math.abs(values[2] - values[0])}</td>
                </tr>
                `)
                console.log(`${stock[u]} values `,values);
                
        }catch(err){
            console.log(err);
        }
    }
    res.send('Data Fetched!');
});

app.get('/download', function(req,res){
    try {
        let options = {format: 'A4', orientation: 'portrait', border:'10m'};
        pdf.create(page.html(), options).toFile('./output.pdf', function(err,resp){
            if (err) return console.log(err);
            res.download(resp.filename);
        })
    } catch (err) {
        console.log(err)
    }
});

app.listen(process.env.PORT || 5000, function(){
    console.log('working on 5000!');
})