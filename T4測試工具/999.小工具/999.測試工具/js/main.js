var key_file;
var merchant_list;

var MID="";
var Client_Public_Key="";
var Client_Private_Key="";
var Server_Public_Key="";
var AES_Key_ID="";
var AES_Key="";
var AES_IV="";

var Default_RU="www.google.com.tw"
var Default_CU="https://prod-21.japaneast.logic.azure.com:443/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4"
var api_now=0;
var version=1;

var oFileIn;
var data
var merchantdata
var paymentdata = [];
var table_select_now = 1

var textfilefunction = '';
		
$(function () {
	merchant_list=merchant_data.map((arr) => arr.CName+'('+arr.env+')')
	merchant_list.forEach((element)=>{
		var options=document.createElement("option")
		options.innerText=element;
		options.value=merchant_list.indexOf(element)
		
		document.getElementById("key_selector").appendChild(options)
	})
	
	
	$('#sit_app').qrcode({
		width:256,
		height:256,
		text:'https://www.icashpay.com.tw/ICP/ICP_Stage.html'
	})
	
	$('#uat_app').qrcode({
		width:256,
		height:256,
		text:'https://www.icashpay.com.tw/ICP/ICP_UAT.html'
	})
});

window.addEventListener('load',
function()
{
	document.getElementById("page1").getElementsByTagName("tr")[1].getElementsByTagName("th")[0].click()
})
//================================================================================page1 function start===========================================================================================
function select_merchant(e)
{
	var data_index=e.value
	if(data_index!="")
	{
		MID=merchant_data[data_index].MID
		Client_Public_Key=merchant_data[data_index].ClientPublicKey
		Client_Private_Key=merchant_data[data_index].ClientPrivateKey
		Server_Public_Key=merchant_data[data_index].ServerPublicKey
		AES_Key_ID=merchant_data[data_index].AESKeyID
		AES_Key=merchant_data[data_index].AESKey
		AES_IV=merchant_data[data_index].AESIV
	}
	else
	{
		MID=""
		Client_Public_Key=""
		Client_Private_Key=""
		Server_Public_Key=""
		AES_Key_ID=""
		AES_Key=""
		AES_IV=""
	}
	api()
}

function function_selector()
{
}

function change_version(id,e)
{
	var row=e.parentNode
	for(var i=0;i< row.getElementsByTagName("th").length;i++)
	{
		row.getElementsByTagName("th")[i].className=""
	}
	e.className="active"
	version=id
	api()
}
function api_change(id,e)
{
	var row=e.parentNode
	for(var i=0;i< row.getElementsByTagName("th").length;i++)
	{
		row.getElementsByTagName("th")[i].className=""
	}
	e.className="active"
	
	api_now=id
	api()
}

function api()
{
	document.getElementById("json_editor2").value=""
	var json_editor=document.getElementById("json_editor1")
	
	var date = new Date();
    var year = (date.getFullYear()).toString();
    var month = (date.getMonth() + 1).toString();
    var day = (date.getDate()).toString();

    var hours = date.getHours().toString();
    var mins = date.getMinutes().toString();
    var secs = date.getSeconds().toString();

    var today;
    var Amt="1000";
	var Rand_TN= ""
	var data=""
	
    for (var i = 0; i < 2; i++) {
        if (month.length < 2) {
            month = "0" + month
        }

        if (day.length < 2) {
            day = "0" + day
        }

        if (hours.length < 2) {
            hours = "0" + hours
        }

        if (mins.length < 2) {
            mins = "0" + mins
        }

        if (secs.length < 2) {
            secs = "0" + secs
        }
    }
	
	today = year + "/" + month + "/" + day + " " + hours + ":" + mins + ":" + secs
	Rand_TN= "MTN"+MID+hours+mins+secs+Math.floor(Math.random()*1001)
	
	switch(version)
	{
		case 0:
			
		case 1:
			switch(api_now)
			{
				case 0://ICPO001
					data='{"PlatformID":"'+MID+'","MerchantID": "'+MID+'","MerchantTradeNo": "'+Rand_TN+'","StoreID": "SID0001","StoreName": "SN0001","MerchantTradeDate": "'+today+'","TotalAmount": "'+Amt+'","ItemAmt": "'+Amt+'","UtilityAmt": "0","ItemNonRedeemAmt": "0","UtilityNonRedeemAmt": "0","NonPointAmt": "0","Item": [{"ItemNo": "INO001","ItemName": "IN001","Quantity": "1"}],"TradeMode": "1","CallbackURL": "'+Default_CU+'","RedirectURL": "'+Default_RU+'","AuthICPAccount":""}'
				break;
				case 1://ICPOF001
					data='{"PlatformID":"'+MID+'","MerchantID": "'+MID+'","MerchantTradeNo": "'+Rand_TN+'","StoreID": "SID0001","StoreName": "SN0001","MerchantTradeDate": "'+today+'","TotalAmount": "'+Amt+'","ItemAmt": "'+Amt+'","UtilityAmt": "0","CommAmt": "0","ItemNonRedeemAmt": "0","UtilityNonRedeemAmt": "0","CommNonRedeemAmt": "0","NonPointAmt": "0","Item": [{"ItemNo": "INO001","ItemName": "IN001","Quantity": "1"},{"ItemNo": "INO002","ItemName": "IN002","Quantity": "1"}],"BarCode":"IC"}'
				break;
				case 2://ICPO004
					data='{"PlatformID":"'+MID+'","MerchantID": "'+MID+'","OMerchantTradeNo": "","TransactionID": "","StoreID": "SID0001","StoreName": "SN0001","MerchantTradeNo": "'+Rand_TN+'","RefundTotalAmount": "1000","RefundItemAmt": "1000","RefundUtilityAmt": "0","MerchantTradeDate": "'+today+'"}'
				break;
				case 3://ICPO005
					data='{"PlatformID":"'+MID+'","MerchantID": "'+MID+'","MerchantTradeNo": "'+Rand_TN+'"}'
				break;
				case 4://ICPO007
					data='{"PlatformID":"'+MID+'","MerchantID": "'+MID+'","ICPMID": "1680000000000001","MMemberID": "testor001"}'
				break;
				case 5://ICPO008
					data='{"PlatformID":"'+MID+'","MerchantID": "'+MID+'","MerchantTradeNo": "'+Rand_TN+'","StoreID": "SID0001","StoreName": "SN0001", "MerchantTradeDate": "'+today+'","TotalAmount": "'+Amt+'","ItemAmt": "'+Amt+'","UtilityAmt": "0","ItemNonRedeemAmt": "0","UtilityNonRedeemAmt": "0","NonPointAmt": "0","Item": [{"ItemNo": "INO001","ItemName": "IN001","Quantity": "1"}],"TradeMode": "2", "CallbackURL": "'+Default_CU+'","RedirectURL": "'+Default_RU+'","AuthICPAccount": ""}'
				break;
				case 6://ICPO009
					data='{"PlatformID":"'+MID+'","MerchantID": "'+MID+'","ICPMID": "1680000000000001","MMemberID": "testor001"}'
				break;
				case 7://ICPOB000
					data='{"PlatformID": "'+MID+'","MerchantID": "'+MID+'","BindingTradeNo": "'+Rand_TN+'","StoreName": "SN0001","BindingMode": "1","CallbackURL": "'+Default_CU+'","RedirectURL": "'+Default_RU+'","merchantUserID":"testor001","DisplayInformation":"ç¶å®šæ¸¬è©¦","BindingSubject":"ç¶å®šç‰©å“001","RedeemFlag":"0","ExpiredType":"1","TotalAmtLimit":"'+Amt+'","NonPointAmt":"0","MaxMonthAmt":"30000000"}'
				break;
				case 8://ICPOB004
				    data='{"PlatformID": "'+MID+'","MerchantID": "'+MID+'","MerchantTradeNo": "'+Rand_TN+'","StoreID": "SID0001","StoreName": "SN0001","MerchantTradeDate": "'+today+'","TotalAmount": "'+Amt+'","NonPointAmt": "0","ItemAmt": "'+Amt+'","UtilityAmt": "0","ItemNonRedeemAmt": "0","UtilityNonRedeemAmt": "0","Item": [{"ItemNo": "INO001","ItemName": "IN001","Quantity": "1"}],"Token":""}'
			}
		break;	
	}
	
	json_editor1.value=data
}

function encrypt_decrypt(type)
{
	var data=""
	switch(type)
	{
		case 0:
            var key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256¦ìª÷Æ_
            var iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128¦ìIV

            var encdata = encryptAES_CBC_256(json_editor1.value.toString(), key, iv)
            var X_iCP_Signature;
            var sign = new JSEncrypt()
            sign.setPrivateKey(Client_Private_Key);
            X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")
			
			json_editor2.value='{"Header":{"X-iCP-EncKeyID":"'+AES_Key_ID+'","X-iCP-Signature": "'+X_iCP_Signature+'"},"Body":{"EncData":"'+encdata+'"}}'
		break;
		case 1:
			console.log(typeof json_editor2)
			data =JSON.parse(json_editor2.value)
			console.log(data)
			var key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256¦ìª÷Æ_
			var iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128¦ìIV
			var decrypted_data=JSON.parse(decryptAES_CBC_256(data.EncData.toString(),key,iv))

			json_editor1.value=JSON.stringify(decrypted_data).toString()
		break;
	}
}

function encryptAES_CBC_256(text, key, iv) 
{
    const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
}

function decryptAES_CBC_256(encryptedText, key, iv) 
{
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
//=================================================================================page1 function end============================================================================================

//================================================================================page2 function start===========================================================================================
