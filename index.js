const sendEmailNotification = (email = 'myemailhere@gmail.com', subject = 'Whatever you want', skuArray) => {
    
    const template = HtmlService.createTemplateFromFile('index')
    template.data = skuArray; //data is a global variable available to index.html 
    const message = template.evaluate().getContent();
    
    MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: message
    });
  
}

let master = [];
  
const populateSKUArray = () => {
    const skus = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MasterSKUsCalendar').getRange('C2:C30').getValues();
    const inventories = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MasterSKUsCalendar').getRange('I2:I30').getValues();
    const suggested = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MasterSKUsCalendar').getRange('O2:O30').getValues();
    const reOrderDates = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MasterSKUsCalendar').getRange('P2:P30').getValues();
    let allData = [...skus, ...inventories, ...suggested, ...reOrderDates]; //Not needed
    skus.map(sku => {
      let [title] = sku; //need to destructure due to the way Google Sheets handles data
      master.push({name: title})
    })
  
    inventories.map((inven, index) => {
      let [current] = inven;
      for (let i = 0; i < master.length; i++) {
          if (i === index) {
            //Object spread operator does not work on Google Apps Scripts
            master[i] = Object.assign(master[i], {currentInventory: current})
          }
      }
    })
  
    suggested.map((sugg, index) => {
      let [suggested] = sugg;
      for (let i = 0; i < master.length; i++) {
          if (i === index) {
            master[i] = Object.assign(master[i], {reOrderPoint: suggested})
          }
      }
     })
  
     reOrderDates.map((date, index) => {
      let [datetime] = date;
      for (let i = 0; i < master.length; i++) {
          if (i === index) {
            master[i] = Object.assign(master[i], {reOrderDate: String(datetime).split('').slice(0,10).join('') + ' 2020'})
          }
      }
     })

     let emailList = master.filter(sku => typeof sku.reOrderPoint === 'number' 
     && sku.reOrderPoint !== 0 && sku.reOrderPoint !== undefined)
     let now = new Date();
     let secondList = master.filter(sku => sku.reOrderDate < now)
     Logger.log(emailList, secondList) //Logger.log is scuffed console.log
     return emailList;
}
  
const main = () => { //This is run daily by a trigger handled by GAS api
    const data = populateSKUArray();
    sendEmailNotification('myemail@gmail.com', 'Whatever you want', data);
}