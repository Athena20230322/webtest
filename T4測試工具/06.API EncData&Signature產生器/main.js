var oFileIn;
var key_file;
var MID;
var PID;
var Client_Public_Key;
var Client_Private_Key
var Server_Public_Key;
var AES_Key_ID;
var AES_Key;
var AES_IV;
var case_now = 0;
var merchant_list;
var API_show_list=[{sl:[1]},
				   {sl:[1,2]}]

var mid_input;
var pid_input;
var bc_input;
var buyid_input;
var sbc_input;
var stob_input;
var icpmid_input;
var suid_input;
var ti_input;
var motn_input;
var rta_input;
var eki_input;
var signature_input;
var ed_input;
var edj_input;
var ta_input;
var bt_input;
var cu_input;
var ru_input;

var red_input;
var redj_input;

var default_callbackURL="https://prod-21.japaneast.logic.azure.com:443/workflows/896a5a51348c488386c686c8e83293c8/triggers/ICPOB002/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FICPOB002%2Frun&sv=1.0&sig=81SiqqBYwWTplvxc3OSCCU6sk9oNT6nI4w5t9Z8v6j4"
$(function () {
	merchant_list=merchant_data.map((arr) => arr.CName+'('+arr.env+')')
	merchant_list.forEach((element)=>{
		var options=document.createElement("option")
		options.innerText=element;
		options.value=merchant_list.indexOf(element)

		document.getElementById("key_selector").appendChild(options)
	})

	mid_input=document.getElementById('MerchantID')
	pid_input=document.getElementById('PlatformID')
	bc_input=document.getElementById('BarCode')
	sbc_input=document.getElementById('StoreBarCode')
	buyid_input=document.getElementById('BuyerID')
	stob_input=document.getElementById('儲值金額')
	ti_input=document.getElementById('TransactionID')
	icpmid_input=document.getElementById("168ID")
	suid_input=document.getElementById("SUID")
	motn_input=document.getElementById('MerchantOriginalTradeNo')
	rta_input=document.getElementById('RefundTotalAmount')
	eki_input=document.getElementById('EncKeyID')
	signature_input=document.getElementById('Signature')
	ed_input=document.getElementById('EncData')
	edj_input=document.getElementById('EncDataJSON')
	red_input=document.getElementById('ResponseEncData')
	redj_input=document.getElementById('ResponseEncDataJson')
	ta_input=document.getElementById('TestAmt')
	bt_input=document.getElementById('BindingToken')
	cu_input=document.getElementById('CallbackURL')
	ru_input=document.getElementById('RedirectURL')

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

function select_merchant(e){
	if(e.value!="")
	{
		var data_index=e.value
		MID=merchant_data[data_index].MID
		PID=merchant_data[data_index].PID
		Client_Public_Key=merchant_data[data_index].ClientPublicKey
		Client_Private_Key=merchant_data[data_index].ClientPrivateKey
		Server_Public_Key=merchant_data[data_index].ServerPublicKey
		AES_Key_ID=merchant_data[data_index].AESKeyID
		AES_Key=merchant_data[data_index].AESKey
		AES_IV=merchant_data[data_index].AESIV

		if(merchant_data[data_index].Promoter!=0)
		{
			document.getElementsByTagName("p")[0].innerText="特約機構類型：推廣商"
		}
		else
		{
			document.getElementsByTagName("p")[0].innerText="特約機構類型：一般特店"
		}
		document.getElementById("sample_code").style.display = ""

	}
	else
	{
		document.getElementsByTagName("p")[0].innerText=""
		document.getElementById("sample_code").style.display = "none"
	}

	change_api_new(0,document.getElementById("sample_code").getElementsByTagName("th")[0])
}

function change_type(type, e) {

            table = e.parentNode.parentNode

            for (var i = 0; i < table.getElementsByTagName("th").length; i++) {
                table.getElementsByTagName("th")[i].className = ""
            }

            e.className = "active"
            switch (type) {
                case 0:
                    document.getElementById("online_api_table").style.display = ""
                    document.getElementById("offline_api_table").style.display = "none"

                    document.getElementById("online_api_table").getElementsByTagName("th")[0].click()
                    break;
                case 1:
                    document.getElementById("online_api_table").style.display = "none"
                    document.getElementById("offline_api_table").style.display = ""

                    document.getElementById("offline_api_table").getElementsByTagName("th")[0].click()
                    break;
            }
        }

function change_api_new(id,e){
	var table = e.parentNode.parentNode

	for (var i = 0; i < 8; i++) {
                table.getElementsByTagName("th")[i].className = ""
            }
	e.className = "active"

	mid_input.value=MID
	bc_input.value=""
	buyid_input.value=""
	icpmid_input.value=""
	suid_input.value=""
	ti_input.value=""
	rta_input.value=""
	eki_input.value=AES_Key_ID
	signature_input.value=""
	ed_input.value=""
	edj_input.value=""
	motn_input.value=""
	red_input.value=""
	redj_input.value=""
	ta_input.value="100"
	bt_input.value=""

	case_now=id

	switch(id)
	{
		case 0:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			icpmid_input.parentNode.parentNode.style.display="none"
			suid_input.parentNode.parentNode.style.display="none"
			ti_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			motn_input.parentNode.parentNode.style.display="none"
			ta_input.parentNode.parentNode.style.display=""
			bt_input.parentNode.parentNode.style.display="none"
			cu_input.parentNode.parentNode.style.display=""
			ru_input.parentNode.parentNode.style.display=""
			document.getElementById('qrcode').innerHTML=""
		break;
		case 1:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display=""
			sbc_input.parentNode.parentNode.style.display=""
			stob_input.parentNode.parentNode.style.display=""
			icpmid_input.parentNode.parentNode.style.display=""
			suid_input.parentNode.parentNode.style.display="none"
			ti_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			motn_input.parentNode.parentNode.style.display="none"
			ta_input.parentNode.parentNode.style.display=""
			bt_input.parentNode.parentNode.style.display="none"
			cu_input.parentNode.parentNode.style.display="none"
			ru_input.parentNode.parentNode.style.display="none"
			document.getElementById('qrcode').innerHTML=""
		break;
		case 2:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			icpmid_input.parentNode.parentNode.style.display="none"
			suid_input.parentNode.parentNode.style.display="none"
			ti_input.parentNode.parentNode.style.display=""
			rta_input.parentNode.parentNode.style.display=""
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			motn_input.parentNode.parentNode.style.display=""
			bt_input.parentNode.parentNode.style.display="none"
			ta_input.parentNode.parentNode.style.display="none"
			document.getElementById('qrcode').innerHTML=""
		break;
		case 3:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			icpmid_input.parentNode.parentNode.style.display=""
			suid_input.parentNode.parentNode.style.display=""
			ti_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			motn_input.parentNode.parentNode.style.display="none"
			ta_input.parentNode.parentNode.style.display="none"
			bt_input.parentNode.parentNode.style.display="none"
			document.getElementById('qrcode').innerHTML=""
		break;
		case 4:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			icpmid_input.parentNode.parentNode.style.display="none"
			suid_input.parentNode.parentNode.style.display="none"
			ti_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			motn_input.parentNode.parentNode.style.display="none"
			ta_input.parentNode.parentNode.style.display="none"
			bt_input.parentNode.parentNode.style.display="none"
			document.getElementById('qrcode').innerHTML=""
		break;
		case 5:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			icpmid_input.parentNode.parentNode.style.display=""
			suid_input.parentNode.parentNode.style.display=""
			ti_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			motn_input.parentNode.parentNode.style.display="none"
			ta_input.parentNode.parentNode.style.display="none"
			bt_input.parentNode.parentNode.style.display="none"
			document.getElementById('qrcode').innerHTML=""
		break;
		case 6:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			icpmid_input.parentNode.parentNode.style.display="none"
			suid_input.parentNode.parentNode.style.display=""
			ti_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			motn_input.parentNode.parentNode.style.display="none"
			ta_input.parentNode.parentNode.style.display=""
			bt_input.parentNode.parentNode.style.display="none"
			document.getElementById('qrcode').innerHTML=""
		break;
		case 7:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			icpmid_input.parentNode.parentNode.style.display="none"
			suid_input.parentNode.parentNode.style.display="none"
			ti_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			motn_input.parentNode.parentNode.style.display=""
			ta_input.parentNode.parentNode.style.display="none"
			document.getElementById('qrcode').innerHTML=""
			bt_input.parentNode.parentNode.style.display="none"
			cu_input.parentNode.parentNode.style.display="none"
			ru_input.parentNode.parentNode.style.display="none"
		break;
		case 8:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			icpmid_input.parentNode.parentNode.style.display="none"
			suid_input.parentNode.parentNode.style.display="none"
			motn_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			red_input.parentNode.parentNode.style.display=""
			redj_input.parentNode.parentNode.style.display=""
			ta_input.parentNode.parentNode.style.display=""
			bt_input.parentNode.parentNode.style.display=""
			cu_input.parentNode.parentNode.style.display="none"
			ru_input.parentNode.parentNode.style.display="none"
		break;
			case 9:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			buyid_input.parentNode.parentNode.style.display=""
			icpmid_input.parentNode.parentNode.style.display="none"
			suid_input.parentNode.parentNode.style.display="none"
			motn_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			red_input.parentNode.parentNode.style.display=""
			redj_input.parentNode.parentNode.style.display=""
			ta_input.parentNode.parentNode.style.display=""
			bt_input.parentNode.parentNode.style.display=""
			cu_input.parentNode.parentNode.style.display="none"
			ru_input.parentNode.parentNode.style.display="none"
		break;

		case 10:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display=""
			sbc_input.parentNode.parentNode.style.display=""
			stob_input.parentNode.parentNode.style.display=""
			icpmid_input.parentNode.parentNode.style.display="none"
			suid_input.parentNode.parentNode.style.display="none"
			ti_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			motn_input.parentNode.parentNode.style.display="none"
			ta_input.parentNode.parentNode.style.display=""
			bt_input.parentNode.parentNode.style.display="none"
			cu_input.parentNode.parentNode.style.display="none"
			ru_input.parentNode.parentNode.style.display="none"
			document.getElementById('qrcode').innerHTML=""
		break;
		
	    case 11:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			buyid_input.parentNode.parentNode.style.display=""
			icpmid_input.parentNode.parentNode.style.display="none"
			suid_input.parentNode.parentNode.style.display="none"
			motn_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			red_input.parentNode.parentNode.style.display=""
			redj_input.parentNode.parentNode.style.display=""
			ta_input.parentNode.parentNode.style.display=""
			bt_input.parentNode.parentNode.style.display=""
			cu_input.parentNode.parentNode.style.display="none"
			ru_input.parentNode.parentNode.style.display="none"
		break;
		
		case 12:
			mid_input.parentNode.parentNode.style.display=""
			bc_input.parentNode.parentNode.style.display="none"
			buyid_input.parentNode.parentNode.style.display=""
			icpmid_input.parentNode.parentNode.style.display="none"
			suid_input.parentNode.parentNode.style.display="none"
			motn_input.parentNode.parentNode.style.display="none"
			rta_input.parentNode.parentNode.style.display="none"
			eki_input.parentNode.parentNode.style.display=""
			signature_input.parentNode.parentNode.style.display=""
			ed_input.parentNode.parentNode.style.display=""
			edj_input.parentNode.parentNode.style.display=""
			red_input.parentNode.parentNode.style.display=""
			redj_input.parentNode.parentNode.style.display=""
			ta_input.parentNode.parentNode.style.display=""
			bt_input.parentNode.parentNode.style.display=""
			cu_input.parentNode.parentNode.style.display="none"
			ru_input.parentNode.parentNode.style.display="none"
		break;

	}
}

function create_postman_data(){
    var date = new Date();
    var year = (date.getFullYear()).toString();
    var month = (date.getMonth() + 1).toString();
    var day = (date.getDate()).toString();

    var hours = date.getHours().toString();
    var mins = date.getMinutes().toString();
    var secs = date.getSeconds().toString();

    var today;
    var data;
    var res_data;
    var res_json;

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

    var test_AMT = ta_input.value+"00"
    //var test_MTN = "MTN"+MID+hours+mins+secs+Math.floor(Math.random()*1001)
	var test_MTN = `Sample${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 17)}`;
	var test_PayType = "Token"
	var test_buyid = "ic"+buyid_input.value
	var test_sbuyid = "88"+buyid_input.value
	
	var test_pid = "10523860"
    var test_ITN = ti_input.value
    var test_IA = icpmid_input.value
    var test_MMID = suid_input.value
    var test_MI = "/0000001"
	var test_OMTN= motn_input.value
    var test_TT = "TT00000001"
    var test_SI = "TM01"
	var test_topup = "100"
	var test_txamt = "10"
	var test_ccy = "TWD"
    var test_SN = "測試商戶1"
    var test_INO = "001"
    var test_IN = "測試商品1"
    var test_BC = "ic"+bc_input.value
	//var test_BUYID = "ic"+bc_input.value
	var test_SBC ="88"+sbc_input.value
	var test_CU = cu_input.value
	var test_RU = ru_input.value

    var title_json = "JSON data:"
    var title_icp_url_scheme = "ICP支付URL Scheme:"
    var api_string = ["https://icp-payment-preprod.icashpay.com.tw/api/V2/Payment/Cashier/CreateTradeICPO",
					  "https://icp-payment-preprod.icashpay.com.tw/api/V2/Payment/POS/DeductICPOF",
					  "https://icp-payment-preprod.icashpay.com.tw/api/V2/Payment/Cashier/RefundICPO",
					  "https://icp-member-preprod.icashpay.com.tw/api/Member/MemberInfo/BindingMMember",
					  "https://icp-member-preprod.icashpay.com.tw/api/Member/MemberInfo/GetPaymentURL",
					  "https://icp-member-preprod.icashpay.com.tw/api/Member/MemberInfo/CancelBindingMMember",
					  "https://icp-payment-preprod.icashpay.com.tw/api/V2/Payment/Binding/CreateICPBinding",
					  "https://icp-payment-stage.icashpay.com.tw/api/V2/Payment/POS/SETPay",
					  "https://icp-payment-stage.icashpay.com.tw/api/V2/Payment/POS/SETPayCancel",
					  "https://icp-payment-stage.icashpay.com.tw/api/V2/Payment/POS/SETTopUp",
					  "https://icp-payment-stage.icashpay.com.tw/api/Payment/POS/TopUp"

					 ]

	today = year + "/" + month + "/" + day + " " + hours + ":" + mins + ":" + secs

	switch (case_now) {
                case 0: //ICPO001
                    data = {
                        PlatformID: MID,
                        MerchantID: mid_input.value,
                        MerchantTradeNo: test_MTN,
                        StoreID: test_SI,
                        StoreName: test_SN,
                        MerchantTradeDate: today,
                        TotalAmount: test_AMT,
                        ItemAmt: test_AMT,
                        UtilityAmt: "0",
                        ItemNonRedeemAmt: "0",
                        UtilityNonRedeemAmt: "0",
                        NonPointAmt: "0",
                        Item: [{
                            ItemNo: test_INO,
                            ItemName: test_IN,
                            Quantity: "1",
                        }],
                        TradeMode: 1,
                        CallbackURL: test_CU,
                        RedirectURL: test_RU,
                        AuthICPAccount: ''
                    }

                    res_json = {
                        PlatformID: MID,
                        MerchantID: MID,
                        MerchantTradeNo: test_MTN,
                        Timestamp: today,
                        TradeToken: test_TT,
                        ExpiredTime: today
                    }

                    EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;

                    break;

				case 1://ICPOF001
                    data = {
                        PlatformID: "",
                        MerchantID: mid_input.value,
                        MerchantTradeNo: test_MTN,
                        StoreID: test_SI,
                        StoreName: test_SN,
                        MerchantTradeDate: today,
                        TotalAmount: test_AMT,
                        ItemAmt: test_AMT,
                        UtilityAmt: "0",
                        CommAmt: "0",
                        ItemNonRedeemAmt: "0",
                        UtilityNonRedeemAmt: "0",
                        CommNonRedeemAmt: "0",
                        NonPointAmt: "0",
                        Item: [{
                            ItemNo: test_INO,
                            ItemName: test_IN,
                            Quantity: "1"
                        },
						{
							ItemNo: "002",
                            ItemName: "測試商品2",
                            Quantity: "1"
						}],
                        BarCode: test_BC.toUpperCase()
                    }

                    EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;

                    break

                case 2://ICPO004
                    data = {
                        PlatformID: MID,
                        MerchantID: mid_input.value,
                        OMerchantTradeNo: test_OMTN,
                        TransactionID: test_ITN,
                        StoreID: test_SI,
                        StoreName: test_SN,
                        MerchantTradeNo: test_MTN,
                        RefundTotalAmount: rta_input.value+"00",
                        RefundItemAmt: rta_input.value+"00",
                        RefundUtilityAmt: "0",
                        MerchantTradeDate: today
                    }

                    EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;
                    break;
                case 3://ICPO007
                    data = {
                        PlatformID: MID,
                        MerchantID: mid_input.value,
                        ICPMID: test_IA,
                        MMemberID: test_MMID
                    }

                    EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;
                    break;
                case 4://ICPO008
                    data = {
                        PlatformID: MID,
                        MerchantID: mid_input.value,
                        MerchantTradeNo: test_MTN,
                        StoreID: "ICASH-001",
                        StoreName: "測試店名",
                        MerchantTradeDate: today,
                        TotalAmount: test_AMT,
                        ItemAmt: test_AMT,
                        UtilityAmt: "0",
                        ItemNonRedeemAmt: "0",
                        UtilityNonRedeemAmt: "0",
                        NonPointAmt: "0",
                        Item: [{
                            ItemNo: test_INO,
                            ItemName: test_IN,
                            Quantity: "1",
                        }],
                        TradeMode: 2,
                        CallbackURL: test_CU,
                        RedirectURL: test_RU
                     
                    }

                    EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;
                    break;
                case 5://ICPO009
                    data = {
                        PlatformID: MID,
                        MerchantID: mid_input.value,
                        ICPMID: test_IA,
                        MMemberID: test_MMID
                    }

                    EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;
                    break;
				case 6://ICPOB000
					data={
						PlatformID: MID,
						MerchantID: mid_input.value,
						BindingTradeNo: test_MTN,
						StoreName: test_SN,
						BindingMode: "1",
						CallbackURL: test_CU,
						RedirectURL: test_RU,
						merchantUserID:test_MMID,
						DisplayInformation:"綁定測試",
						BindingSubject:"綁定物品001",
						RedeemFlag:"0",
						ExpiredType:"1",
						TotalAmtLimit:test_AMT,
						NonPointAmt:"0",
						MaxMonthAmt:30000000
					}

					console.log(data)
					EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;

					break;
				case 7://ICPO005
					data={
						PlatformID: MID,
						MerchantID: mid_input.value,
						MerchantTradeNo: test_OMTN
					}

					console.log(data)
					EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;

					break;

                 case 9://ICPOS001
                    data = {
						PayType: test_PayType,
						BuyerID: test_buyid,
                        CcY: test_ccy,
                        TxAmt: test_txamt,
                        NonRedeemAmt: "0",
                        NonPointAmt: "0",
                        StoreId: "217477",
                        StoreName: "見晴",
                        PosNo: "01",
                        OPSeq: test_MTN,
                        OPTime: today,
						ReceiptNo : null,
						ReceiptReriod: null,
                        TaxID: "70804847",
                        CorpID: "22555003",
						Vehicle: null,
						Donate: null,
                        ItemAmt: "10",
                        UtilityAmt: "0",
                        CommAmt: "0",
                        ExceptAmt1: "0",
                        ExceptAmt2: "0",
                        BonusType: "ByWallet",
						BonusCategory : null,
						BonusID : null,
                        PaymentNo: "038",
                        Remark: "741702",
						Itemlist: [{
             
                        }],
                        ReceiptPrint: "N"
						//BuyerID: "IC5324523456"
						//BuyerID: test_BUYID.toUpperCase()
                        
                    }

                    EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;

                    break;

			case 10://WC014
                    data = {
                        PlatformID: MID,
                        MerchantID: mid_input.value,
                        MerchantTradeNo: test_MTN,
                        MerchantTradeDate: today,
						TopUPAmt: test_topup,
                        CCy: test_ccy,
                        BarCode: test_SBC.toUpperCase()
                    }

                    EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;

                    break;
		     case 11://ICPOS003
                    data = {
                        OPSeq: "Sample20241115092412958",                    
                        CorpID: "22555003"
						//BuyerID: "IC5324523456"
						//BuyerID: test_BUYID.toUpperCase()
                        
                    }

                    EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;

                    break;
			case 12://ICPOS004
                    data = {
						//PayType: test_PayType,
						BuyerID: test_sbuyid,
                        CcY: test_ccy,
                        TopUpAmt: test_topup,
						StoreId: "217477",
                        StoreName: "見晴",
						PosNo: "01",
						OPSeq: test_MTN,
						OPTime: today,
						CorpID: "22555003",
						PaymentNo: "038",
						Remark: "741702",
						///ReceiptNo : null,
						//ReceiptReriod: null,
                        
                       
						Itemlist: [{
             
                        }],
						Remark:"123123"
						//BuyerID: "IC5324523456"
						//BuyerID: test_BUYID.toUpperCase()
                        
                    }

                    EncDataJSON.value=JSON.stringify(data);

                    key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
                    iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV

                    var encdata = encryptAES_CBC_256(JSON.stringify(data), key, iv)
                    var X_iCP_Signature;
                    var sign = new JSEncrypt()
                    sign.setPrivateKey(Client_Private_Key);
                    X_iCP_Signature = sign.sign(encdata, CryptoJS.SHA256, "sha256")


                    ed_input.value=encdata;
                    signature_input.value=X_iCP_Signature;

                    break;
			
			
					




            }

}

function decrypte_data(e){
	document.getElementById("qrcode").innerHTML=""
	document.getElementById("ResponseEncDataJson").value=""

	var key = CryptoJS.enc.Utf8.parse(AES_Key);// CryptoJS.enc.Hex.parse('aPMjthjyjOXdFQd6nWIPiNJjR7ScBGBh'); // 256位金鑰
    var iv = CryptoJS.enc.Utf8.parse(AES_IV);//CryptoJS.enc.Hex.parse('xzszjW72bg3IkgYL'); // 128位IV
	var decrypted_data=JSON.parse(decryptAES_CBC_256(e.value,key,iv))

	document.getElementById("ResponseEncDataJson").value=JSON.stringify(decrypted_data)

	if(case_now==0)
	{
		create_qrcode(decrypted_data,case_now)
	}
	else if(case_now==6)
	{
		create_qrcode(decrypted_data,case_now)
	}
}


function create_qrcode(qrcode_data,case_no){

	document.getElementById("qrcode1").innerHTML=""
	document.getElementById("qrcode2").innerHTML=""
	document.getElementById("qrcode3").innerHTML=""
	switch(case_no)
	{
		case 0:
			$('#qrcode1').qrcode({
				width:256,
				height:256,
				text:qrcode_data.TradeToken
			})
			$('#qrcode2').qrcode({
				width:256,
				height:256,
				text:"icashpay://www.icashpay.com.tw/ICP/?Actions=Mainaction&Event=ICPO002&ValueType=1&Value="+qrcode_data.TradeToken
			})
			$('#qrcode3').qrcode({
				width:256,
				height:256,
				text:"https://icpbridge.icashsys.com.tw/ICP/?Actions=Mainaction&Event=ICPO002&ValueType=1&Value="+qrcode_data.TradeToken
			})
		break;
		case 6:
			$('#qrcode1').qrcode({
				width:256,
				height:256,
				text:qrcode_data.TradeToken
			})
			$('#qrcode2').qrcode({
				width:256,
				height:256,
				text:"icashpay://www.icashpay.com.tw/ICP/?Actions=Mainaction&Event=ICPO002&ValueType=1&Value="+qrcode_data.TradeToken
			})
			$('#qrcode3').qrcode({
				width:256,
				height:256,
				text:"https://icpbridge.icashsys.com.tw/ICP/?Actions=Mainaction&Event=ICPO002&ValueType=1&Value="+qrcode_data.TradeToken
			})
		break;
	}
}

function encryptAES_CBC_256(text, key, iv) {
            const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
            return encrypted.toString();
        }

// 解密
function decryptAES_CBC_256(encryptedText, key, iv) {
            const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
            return decrypted.toString(CryptoJS.enc.Utf8);
        }

function post_data() {
            $.ajax({
                url: '{api}',
                type: 'POST',
                data: JSON.stringify(
                    {
                        header: {
                            'X-iCP-EncKeyID': '{X-iCP-EncKeyID}',
                            'X-iCP-Signature': '{X-iCP-Signature}'
                        },
                        Body: { EndData: '{EncData}' }
                    }
                ),
                contentType: 'application/x-www-form-urlencoded;charset=utf-8;',
                success: function (data) {
                    decrypt_data()
                },
                error: function (ex) {
                    console.log(ex)
                }
            })
        }

