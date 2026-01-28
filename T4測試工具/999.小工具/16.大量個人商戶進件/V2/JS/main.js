var excel_data=[]
var excel_data_output=[]
var web_data_output=[]
var otp_data_output=[]
var p55_auth_output=""
var bank_auth_output=[]
var img_ins=""
var user_data=[]
var test=[]
var special_IDNO=["N121058900"]

$(function() {
    oFileIn = document.getElementById('file_input');
    if(oFileIn.addEventListener) {
        oFileIn.addEventListener('change', filePicked, false);
    }
});

function step(type)
{
	var idno_type=['初發','補發','換發']
	var idno_location=['連江', '金門', '宜縣', '竹縣', '苗縣', '彰縣', '投縣', '雲縣', '嘉縣', '屏縣', '東縣', '花縣', '澎縣', '基市', '竹市', '嘉市', '北市', '高市/高縣', '新北市/北縣', '中市/中縣', '南市/南縣']
	var idno_location_id=['09007000', '09020000', '10002000', '10004000', '10005000', '10007000', '10008000', '10009000', '10010000', '10013000', '10014000', '10015000', '10016000', '10017000', '10018000', '10020000', '63000000', '64000000', '65000000', '66000000', '67000000']
	
	var location=[
					{
                        area:"臺北市",
						area_detail:[
										{name:"中正區",zip:"100"},
										{name:"大同區",zip:"103"},
										{name:"中山區",zip:"104"},
										{name:"松山區",zip:"105"},
										{name:"大安區",zip:"106"},
										{name:"萬華區",zip:"108"},
										{name:"信義區",zip:"110"},
										{name:"士林區",zip:"111"},
										{name:"北投區",zip:"112"},
										{name:"內湖區",zip:"114"},
										{name:"南港區",zip:"115"},
										{name:"文山區",zip:"116"}
									]
                    },
					{
                        area:"基隆市",
						area_detail:[
										{name:"仁愛區",zip:"200"},
										{name:"信義區",zip:"201"},
										{name:"中正區",zip:"202"},
										{name:"中山區",zip:"203"},
										{name:"安樂區",zip:"204"},
										{name:"暖暖區",zip:"205"},
										{name:"七堵區",zip:"206"}

									]
                    },
					{
                        area:"新北市",
						area_detail:[
										{name:"萬里區",zip:"207"},
										{name:"金山區",zip:"208"},
										{name:"板橋區",zip:"220"},
										{name:"汐止區",zip:"221"},
										{name:"深坑區",zip:"222"},
										{name:"石碇區",zip:"223"},
										{name:"瑞芳區",zip:"224"},
										{name:"平溪區",zip:"226"},
										{name:"雙溪區",zip:"227"},
										{name:"貢寮區",zip:"228"},
										{name:"新店區",zip:"231"},
										{name:"坪林區",zip:"232"},
										{name:"烏來區",zip:"233"},
										{name:"永和區",zip:"234"},
										{name:"中和區",zip:"235"},
										{name:"土城區",zip:"236"},
										{name:"三峽區",zip:"237"},
										{name:"樹林區",zip:"238"},
										{name:"鶯歌區",zip:"239"},
										{name:"三重區",zip:"241"},
										{name:"新莊區",zip:"242"},
										{name:"泰山區",zip:"243"},
										{name:"林口區",zip:"244"},
										{name:"蘆洲區",zip:"247"},
										{name:"五股區",zip:"248"},
										{name:"八里區",zip:"249"},
										{name:"淡水區",zip:"251"},
										{name:"三芝區",zip:"252"},
										{name:"石門區",zip:"253"}							
									]
					},
					{
                        area:"宜蘭縣",
						area_detail:[
										{name:"宜蘭市",zip:"260"},
										{name:"頭城鎮",zip:"261"},
										{name:"礁溪鄉",zip:"262"},
										{name:"壯圍鄉",zip:"263"},
										{name:"員山鄉",zip:"264"},
										{name:"羅東鎮",zip:"265"},
										{name:"三星鄉",zip:"266"},
										{name:"大同鄉",zip:"267"},
										{name:"五結鄉",zip:"268"},
										{name:"冬山鄉",zip:"269"},
										{name:"蘇澳鎮",zip:"270"},
										{name:"南澳鄉",zip:"272"},
										{name:"釣魚台",zip:"290"},	
									]										
					},
					{
                        area:"新竹市",
						area_detail:[						
										{name:"東區",zip:"30069"},
										{name:"北區",zip:"30042"},
										{name:"香山區",zip:"30093"}
									]										
					},
					{
                        area:"新竹縣",
						area_detail:[
										{name:"竹北市",zip:"302"},
										{name:"湖口鄉",zip:"303"},
										{name:"新豐鄉",zip:"304"},
										{name:"新埔鎮",zip:"305"},
										{name:"關西鎮",zip:"306"},
										{name:"芎林鄉",zip:"307"},
										{name:"寶山鄉",zip:"308"},
										{name:"竹東鎮",zip:"310"},
										{name:"五峰鄉",zip:"311"},
										{name:"橫山鄉",zip:"312"},
										{name:"尖石鄉",zip:"313"},
										{name:"北埔鄉",zip:"314"},
										{name:"峨眉鄉",zip:"315"}
									]										
					},
					{
                        area:"桃園市",
						area_detail:[
										{name:"中壢區",zip:"320"},
										{name:"平鎮區",zip:"324"},
										{name:"龍潭區",zip:"325"},
										{name:"楊梅區",zip:"326"},
										{name:"新屋區",zip:"327"},
										{name:"觀音區",zip:"328"},
										{name:"桃園區",zip:"330"},
										{name:"龜山區",zip:"333"},
										{name:"八德區",zip:"334"},
										{name:"大溪區",zip:"335"},
										{name:"復興區",zip:"336"},
										{name:"大園區",zip:"337"},
										{name:"蘆竹區",zip:"338"}
									]										
					},
					{
                        area:"苗栗縣",
						area_detail:[						
										{name:"竹南鎮",zip:"350"},
										{name:"頭份鎮",zip:"351"},
										{name:"三灣鄉",zip:"352"},
										{name:"南庄鄉",zip:"353"},
										{name:"獅潭鄉",zip:"354"},
										{name:"後龍鎮",zip:"356"},
										{name:"通霄鎮",zip:"357"},
										{name:"苑裡鎮",zip:"358"},
										{name:"苗栗市",zip:"360"},
										{name:"造橋鄉",zip:"361"},
										{name:"頭屋鄉",zip:"362"},
										{name:"公館鄉",zip:"363"},
										{name:"大湖鄉",zip:"364"},
										{name:"泰安鄉",zip:"365"},
										{name:"銅鑼鄉",zip:"366"},
										{name:"三義鄉",zip:"367"},
										{name:"西湖鄉",zip:"368"},
										{name:"卓蘭鎮",zip:"369"}
									]										
					},
					{
                        area:"臺中市",
						area_detail:[	
										{name:"中區",zip:"400"},
										{name:"東區",zip:"401"},
										{name:"南區",zip:"402"},
										{name:"西區",zip:"403"},
										{name:"北區",zip:"404"},
										{name:"北屯區",zip:"406"},
										{name:"西屯區",zip:"407"},
										{name:"南屯區",zip:"408"},
										{name:"太平區",zip:"411"},
										{name:"大里區",zip:"412"},
										{name:"霧峰區",zip:"413"},
										{name:"烏日區",zip:"414"},
										{name:"豐原區",zip:"420"},
										{name:"后里區",zip:"421"},
										{name:"石岡區",zip:"422"},
										{name:"東勢區",zip:"423"},
										{name:"和平區",zip:"424"},
										{name:"新社區",zip:"426"},
										{name:"潭子區",zip:"427"},
										{name:"大雅區",zip:"428"},
										{name:"神岡區",zip:"429"},
										{name:"大肚區",zip:"432"},
										{name:"沙鹿區",zip:"433"},
										{name:"龍井區",zip:"434"},
										{name:"梧棲區",zip:"435"},
										{name:"清水區",zip:"436"},
										{name:"大甲區",zip:"437"},
										{name:"外埔區",zip:"438"},
										{name:"大安區",zip:"439"}
									]										
					},
					{
                        area:"彰化縣",
						area_detail:[						
										{name:"彰化市",zip:"500"},
										{name:"芬園鄉",zip:"502"},
										{name:"花壇鄉",zip:"503"},
										{name:"秀水鄉",zip:"504"},
										{name:"鹿港鎮",zip:"505"},
										{name:"福興鄉",zip:"506"},
										{name:"線西鄉",zip:"507"},
										{name:"和美鎮",zip:"508"},
										{name:"伸港鄉",zip:"509"},
										{name:"員林鎮",zip:"510"},
										{name:"社頭鄉",zip:"511"},
										{name:"永靖鄉",zip:"512"},
										{name:"埔心鄉",zip:"513"},
										{name:"溪湖鎮",zip:"514"},
										{name:"大村鄉",zip:"515"},
										{name:"埔鹽鄉",zip:"516"},
										{name:"田中鎮",zip:"520"},
										{name:"北斗鎮",zip:"521"},
										{name:"田尾鄉",zip:"522"},
										{name:"埤頭鄉",zip:"523"},
										{name:"溪州鄉",zip:"524"},
										{name:"竹塘鄉",zip:"525"},
										{name:"二林鎮",zip:"526"},
										{name:"大城鄉",zip:"527"},
										{name:"芳苑鄉",zip:"528"},
										{name:"二水鄉",zip:"530"}
									]										
					},
					{
                        area:"南投縣",
						area_detail:[						
										{name:"南投市",zip:"540"},
										{name:"中寮鄉",zip:"541"},
										{name:"草屯鎮",zip:"542"},
										{name:"國姓鄉",zip:"544"},
										{name:"埔里鎮",zip:"545"},
										{name:"仁愛鄉",zip:"546"},
										{name:"名間鄉",zip:"551"},
										{name:"集集鎮",zip:"552"},
										{name:"水里鄉",zip:"553"},
										{name:"魚池鄉",zip:"555"},
										{name:"信義鄉",zip:"556"},
										{name:"竹山鎮",zip:"557"},
										{name:"鹿谷鄉",zip:"558"}
									]										
					},
					{
                        area:"嘉義市",
						area_detail:[						
										{name:"東區",zip:"600"},
										{name:"西區",zip:"601"}
									]										
					},
					{
                        area:"嘉義縣",
						area_detail:[						
										{name:"番路鄉",zip:"602"},
										{name:"梅山鄉",zip:"603"},
										{name:"竹崎鄉",zip:"604"},
										{name:"阿里山",zip:"605"},
										{name:"中埔鄉",zip:"606"},
										{name:"大埔鄉",zip:"607"},
										{name:"水上鄉",zip:"608"},
										{name:"鹿草鄉",zip:"611"},
										{name:"太保市",zip:"612"},
										{name:"朴子市",zip:"613"},
										{name:"東石鄉",zip:"614"},
										{name:"六腳鄉",zip:"615"},
										{name:"新港鄉",zip:"616"},
										{name:"民雄鄉",zip:"621"},
										{name:"大林鎮",zip:"622"},
										{name:"溪口鄉",zip:"623"},
										{name:"義竹鄉",zip:"624"},
										{name:"布袋鎮",zip:"625"}
									]
					},
					{
                        area:"雲林縣",
						area_detail:[						
										{name:"斗南鎮",zip:"630"},
										{name:"大埤鄉",zip:"631"},
										{name:"虎尾鎮",zip:"632"},
										{name:"土庫鎮",zip:"633"},
										{name:"褒忠鄉",zip:"634"},
										{name:"東勢鄉",zip:"635"},
										{name:"臺西鄉",zip:"636"},
										{name:"崙背鄉",zip:"637"},
										{name:"麥寮鄉",zip:"638"},
										{name:"斗六市",zip:"640"},
										{name:"林內鄉",zip:"643"},
										{name:"古坑鄉",zip:"646"},
										{name:"莿桐鄉",zip:"647"},
										{name:"西螺鎮",zip:"648"},
										{name:"二崙鄉",zip:"649"},
										{name:"北港鎮",zip:"651"},
										{name:"水林鄉",zip:"652"},
										{name:"口湖鄉",zip:"653"},
										{name:"四湖鄉",zip:"654"},
										{name:"元長鄉",zip:"655"}
									]
					},
					{
                        area:"臺南市",
						area_detail:[						
										{name:"中西區",zip:"700"},
										{name:"東區",zip:"701"},
										{name:"南區",zip:"702"},
										{name:"北區",zip:"704"},
										{name:"安平區",zip:"708"},
										{name:"安南區",zip:"709"},
										{name:"永康區",zip:"710"},
										{name:"歸仁區",zip:"711"},
										{name:"新化區",zip:"712"},
										{name:"左鎮區",zip:"713"},
										{name:"玉井區",zip:"714"},
										{name:"楠西區",zip:"715"},
										{name:"南化區",zip:"716"},
										{name:"仁德區",zip:"717"},
										{name:"關廟區",zip:"718"},
										{name:"龍崎區",zip:"719"},
										{name:"官田區",zip:"720"},
										{name:"麻豆區",zip:"721"},
										{name:"佳里區",zip:"722"},
										{name:"西港區",zip:"723"},
										{name:"七股區",zip:"724"},
										{name:"將軍區",zip:"725"},
										{name:"學甲區",zip:"726"},
										{name:"北門區",zip:"727"},
										{name:"新營區",zip:"730"},
										{name:"後壁區",zip:"731"},
										{name:"白河區",zip:"732"},
										{name:"東山區",zip:"733"},
										{name:"六甲區",zip:"734"},
										{name:"下營區",zip:"735"},
										{name:"柳營區",zip:"736"},
										{name:"鹽水區",zip:"737"},
										{name:"善化區",zip:"741"},
										{name:"大內區",zip:"742"},
										{name:"山上區",zip:"743"},
										{name:"新市區",zip:"744"},
										{name:"安定區",zip:"745"},
									]
					},
					{
                        area:"高雄市",
						area_detail:[						
										{name:"新興區",zip:"800"},
										{name:"前金區",zip:"801"},
										{name:"苓雅區",zip:"802"},
										{name:"鹽埕區",zip:"803"},
										{name:"鼓山區",zip:"804"},
										{name:"旗津區",zip:"805"},
										{name:"前鎮區",zip:"806"},
										{name:"三民區",zip:"807"},
										{name:"楠梓區",zip:"811"},
										{name:"小港區",zip:"812"},
										{name:"左營區",zip:"813"},
										{name:"仁武區",zip:"814"},
										{name:"大社區",zip:"815"},
										{name:"岡山區",zip:"820"},
										{name:"路竹區",zip:"821"},
										{name:"阿蓮區",zip:"822"},
										{name:"田寮區",zip:"823"},
										{name:"燕巢區",zip:"824"},
										{name:"橋頭區",zip:"825"},
										{name:"梓官區",zip:"826"},
										{name:"彌陀區",zip:"827"},
										{name:"永安區",zip:"828"},
										{name:"湖內區",zip:"829"},
										{name:"鳳山區",zip:"830"},
										{name:"大寮區",zip:"831"},
										{name:"林園區",zip:"832"},
										{name:"鳥松區",zip:"833"},
										{name:"大樹區",zip:"840"},
										{name:"旗山區",zip:"842"},
										{name:"美濃區",zip:"843"},
										{name:"六龜區",zip:"844"},
										{name:"內門區",zip:"845"},
										{name:"杉林區",zip:"846"},
										{name:"甲仙區",zip:"847"},
										{name:"桃源區",zip:"848"},
										{name:"那瑪夏區",zip:"849"},
										{name:"茂林區",zip:"851"},
										{name:"茄萣區",zip:"852"}
									]
					},
					{
                        area:"南海諸島",
						area_detail:[						
										{name:"東沙",zip:"817"},
										{name:"南沙",zip:"819"}
									]
					},
					{
                        area:"澎湖縣",
						area_detail:[						
										{name:"馬公市",zip:"880"},
										{name:"西嶼鄉",zip:"881"},
										{name:"望安鄉",zip:"882"},
										{name:"七美鄉",zip:"883"},
										{name:"白沙鄉",zip:"884"},
										{name:"湖西鄉",zip:"885"}
									]
					},
					{
                        area:"屏東縣",
						area_detail:[						
										{name:"屏東市",zip:"900"},
										{name:"三地門鄉",zip:"901"},
										{name:"霧臺鄉",zip:"902"},
										{name:"瑪家鄉",zip:"903"},
										{name:"九如鄉",zip:"904"},
										{name:"里港鄉",zip:"905"},
										{name:"高樹鄉",zip:"906"},
										{name:"盬埔鄉",zip:"907"},
										{name:"長治鄉",zip:"908"},
										{name:"麟洛鄉",zip:"909"},
										{name:"竹田鄉",zip:"911"},
										{name:"內埔鄉",zip:"912"},
										{name:"萬丹鄉",zip:"913"},
										{name:"潮州鄉",zip:"920"},
										{name:"泰武鄉",zip:"921"},
										{name:"來義鄉",zip:"922"},
										{name:"萬巒鄉",zip:"923"},
										{name:"崁頂鄉",zip:"924"},
										{name:"新埤鄉",zip:"925"},
										{name:"南州鄉",zip:"926"},
										{name:"林邊鄉",zip:"927"},
										{name:"東港鎮",zip:"928"},
										{name:"琉球鄉",zip:"929"},
										{name:"佳冬鄉",zip:"931"},
										{name:"新園鄉",zip:"932"},
										{name:"枋寮鄉",zip:"940"},
										{name:"枋山鄉",zip:"941"},
										{name:"春日鄉",zip:"942"},
										{name:"獅子鄉",zip:"943"},
										{name:"車城鄉",zip:"944"},
										{name:"牡丹鄉",zip:"945"},
										{name:"恆春鎮",zip:"946"},
										{name:"滿州鎮",zip:"947"}
									]
					},
					{
                        area:"臺東縣",
						area_detail:[						
										{name:"臺東市",zip:"950"},
										{name:"綠島鄉",zip:"951"},
										{name:"蘭嶼鄉",zip:"952"},
										{name:"延平鄉",zip:"953"},
										{name:"卑南鄉",zip:"954"},
										{name:"鹿野鄉",zip:"955"},
										{name:"關山鎮",zip:"956"},
										{name:"海端鄉",zip:"957"},
										{name:"池上鄉",zip:"958"},
										{name:"東河鄉",zip:"959"},
										{name:"成功鎮",zip:"961"},
										{name:"長濱鄉",zip:"962"},
										{name:"太麻里鄉",zip:"963"},
										{name:"金峰鄉",zip:"964"},
										{name:"大武鄉",zip:"965"},
										{name:"達仁鄉",zip:"966"}
									]
					},
					{
                        area:"花蓮縣",
						area_detail:[						
										{name:"花蓮市",zip:"970"},
										{name:"新城鄉",zip:"971"},
										{name:"秀林鄉",zip:"972"},
										{name:"吉安鄉",zip:"973"},
										{name:"壽豐鄉",zip:"974"},
										{name:"鳳林鎮",zip:"975"},
										{name:"光復鄉",zip:"976"},
										{name:"豐濱鄉",zip:"977"},
										{name:"瑞穗鄉",zip:"978"},
										{name:"萬榮鄉",zip:"979"},
										{name:"玉里鎮",zip:"981"},
										{name:"卓溪鄉",zip:"982"},
										{name:"富里鄉",zip:"983"}
									]
					},
					{
                        area:"金門縣",
						area_detail:[						
										{name:"金沙鎮",zip:"890"},
										{name:"金湖鎮",zip:"891"},
										{name:"金寧鄉",zip:"892"},
										{name:"金城鎮",zip:"893"},
										{name:"烈嶼鄉",zip:"894"},
										{name:"烏坵鄉",zip:"896"}
									]
					},
					{
                        area:"連江縣",
						area_detail:[						
										{name:"南竿鄉",zip:"209"},
										{name:"北竿鄉",zip:"210"},
										{name:"莒光鄉",zip:"211"},
										{name:"東引鄉",zip:"212"}
									]
					}
				]
				
	var bank_type=[
					{
						btn:'信用合作社',
						btnc:'3'
					},
					{
						btn:'本國銀行',
						btnc:'1'
					},
					{
						btn:'農漁會信用部',
						btnc:'4'
					}
				   ]			
	

    var condition =false; 	
	switch(type)
	{
		case 0:
		try
		{
			for(var i =0;i<excel_data.length;i++)
			{
				var IDNO_type=idno_type.indexOf((excel_data[i].補換發類別).toString().trim())+1
				var IDNO_date=(excel_data[i].發證日期).toString().replaceAll('/','').replaceAll('-','')
				var IDNO_location=idno_location_id[idno_location.indexOf((excel_data[i].補換地點).toString().trim())]
				var Birthday=(excel_data[i].負責人生日).toString().replaceAll('/',"").replaceAll('-','')
				var IDNO=(excel_data[i].身分證字號).toString()
				var area=(excel_data[i].城市).toString()
				var area_detail=(excel_data[i].區域).toString()
				var store_area=(excel_data[i].商店城市).toString()
				var store_area_detail=(excel_data[i].商店區域).toString()
				
				var zip_code=""
				var store_zip_code=""
				
				if(area!="" && area_detail!="")
				{
					for(var j=0;j<location.length;j++)
					{
						if(location[j].area==area)
						{
							for(var k=0;k<location[j].area_detail.length;k++)
							{
								if(location[j].area_detail[k].name==area_detail)
								{
									zip_code=location[j].area_detail[k].zip
									break
								}
							}
							break;
						}
					}
				}
				
				if(store_area!="" && store_area_detail!="")
				{
					for(var j=0;j<location.length;j++)
					{
						if(location[j].area==store_area)
						{
							for(var k=0;k<location[j].area_detail.length;k++)
							{
								if(location[j].area_detail[k].name==store_area_detail)
								{
									store_zip_code=location[j].area_detail[k].zip
									break
								}
							}
							break;
						}
					}
				}
				
				var condition= (checkID(IDNO) && zip_code!="" && store_zip_code!="")
				var bank_auth=check_bank(excel_data[i].銀行代碼,excel_data[i].分行代碼)
				bank_auth_output.push({user:excel_data[i].負責人姓名,rtn_code:bank_auth.rtn_code,rtn_msg:bank_auth.rtn_msg})
				
				if(condition)
				{
					var sql =""
					sql+="USE ICP_Admin\n\n"
					
					sql+="--編輯區\n"
					sql+="declare\n\n"
					
					sql+="@IDNO varchar(12) = '"+excel_data[i].身分證字號+"', --身分證字號\n"
					sql+="@Email varchar(100) = '"+excel_data[i].管理者信箱+"',\n"
					sql+="@CellPhone varchar(15) ='"+excel_data[i].管理者手機+"',\n"
					sql+="@InvoiceZipCode varchar(5) = '"+zip_code+"', --聯絡地址郵遞區號\n"
					sql+="@InvoiceAddress nvarchar(100) = N'"+excel_data[i].商店地址+"', --聯絡地址\n"
					sql+="@Address_EN varchar(100) = '"+excel_data[i].英文地址.toString().replaceAll("'","''")+"', --英文聯絡地址\n"
					sql+="@PromoterID varchar(8) = '', --推廣商代號\n\n"
					
					sql+="@PrincipalType tinyint = 0, --自然人\n"
					sql+="@CName nvarchar(40) = N'"+excel_data[i].負責人姓名+"', --姓名\n"
					sql+="@NationalityID bigint = 1206, --本國人\n"
					sql+="@PrincipalIDNOType varchar(10) = '"+IDNO_type+"', --補換發類別，1:初發,2:補發,3:換發\n"
					sql+="@PrincipalIDNODate varchar(8) = '"+IDNO_date+"', --發證日期\n"
					sql+="@PrincipalIDNOLocation varchar(50) = '"+IDNO_location+"', --發證地點，請參考雲端資料表 Common_Code.ParentCodeNo = 'ISSUE_LOC'\n"
					sql+="@PrincipalBirthday date = '"+Birthday+"',\n\n"
					
					sql+="@WebSiteName nvarchar(100) = N'"+excel_data[i].商店名稱+"', --商店名稱\n"
					sql+="@WebSiteURL varchar(100) = '"+excel_data[i].商店網站網址+"', --商店網址\n"
					sql+="@Template tinyint = 3, --商店屬性，1:網絡商店,2:網絡商店+實體商店,3:實體商店\n"
					sql+="@CommoditiyType tinyint = 1, --商品類別(可複選)，1:實體商品,2:虛擬商品(點數/服務),4:遞延商品(課程/SPA),8:商品代收,16:商品代售,32:金融商品，使用&計算\n"
					sql+="@MCCCode int = 4121, --請參考雲端資料表 Common_Code.ParentCodeNo = 'MCCCode'\n"
					sql+="@PayArea tinyint = 1, --支付場域，請參考雲端資料表 Common_Code.ParentCodeNo = 'PayArea'\n"
					sql+="@StoreTel varchar(20) = '"+excel_data[i].商店電話+"', --商店電話\n"
					sql+="@StoreZipCode varchar(5) = '"+store_zip_code+"', --商店地址郵遞區號\n"
					sql+="@StoreAddr nvarchar(100) = N'"+excel_data[i].商店地址+"', --商店地址\n"
					sql+="@StoreTypeName nvarchar(50) = N'交通運輸',\n"
					sql+="@StoreSubTypeName nvarchar(50) = N'計程車',\n"
					sql+="@StoreIntro nvarchar(200) = N'"+excel_data[i].商店簡介+"',--商店簡介\n"
					sql+="@StoreTime nvarchar(50) = N'"+excel_data[i].營業時間+"', --營業時間\n"
					sql+="@StoreName_EN varchar(100) = '"+excel_data[i].商店英文名稱+"', --商店英文名稱\n"
					sql+="@StoreEmail varchar(100) = '"+excel_data[i].商店Email+"', --商店E-mail\n"
					sql+="@DeliveryDayType tinyint = 1, --商品交付天期 1:三天內\n"
					sql+="@RegisterStatus tinyint =1, --註冊階段，個人資料設定階段\n"
					sql+="@BrandTypeName nvarchar(50) = N'Yoxi', --品牌/通路賣場/商圈名稱\n"
					sql+="@SupportEP varchar(200) = NULL, --財金購物支援電支機構設定(僅需設定異動部分即可)(電支機構代碼 + 支援設定碼，允許多筆以','分割) (支援設定碼: A: 支援主掃, B: 支援被掃, C: 兩者皆支援, D: 不支援)\n"
					sql+="@AllowCrditCard int = 1, --是否支援財金購物的信用卡交易(0: 不支援, 1: 支援)\n"
					sql+="@Enable int = 1, --是否啟用財金購物(0: 不啟用, 1: 啟用)\n"
					sql+="@StoreName_EN_TWQR varchar(50)='"+excel_data[i].特約商店英文名稱+"',  --財金特店英文名稱\n"
					sql+="@StoreName_CH_TWQR nvarchar(20)=N'"+excel_data[i].特約商店中文名稱+"',  --財金特店中文名稱\n"
					sql+="@ShortName nvarchar(5)=N'"+excel_data[i].特店簡稱+"' --商店簡稱\n\n"
		
					sql+="--非編輯區\n"
					sql+="----------------------------------\n"
					sql+="declare\n"
					sql+="@CreateSource varchar(20) = 'OnlineContract',\n"
					sql+="@CreateDate datetime =dateadd(HH,8,getutcdate()),\n"
					sql+="@CreateUser varchar(20) = 'OnlineContract',\n"
					sql+="@ExpiresDate datetime = dateadd(MONTH,30, dateadd(HH,8,getutcdate())),\n"
					sql+="@CustomerType tinyint = 2, --個人戶\n"
					sql+="@Account varchar(200) = '', --帳號\n"
					sql+="@Pwd　varchar(200) = '', --密碼\n"
					sql+="@ContactEmail varchar(100) = @Email,\n"
					sql+="@ContactCellPhone varchar(15) = @CellPhone,\n"
					sql+="@EinvoiceEmail varchar(100) = @Email,\n"
					sql+="@ManageEmail varchar(100) = @Email,\n"
					sql+="@ManageCellPhone varchar(15) = @CellPhone,\n"
					sql+="@SalesContactPerson nvarchar(10) = @CName,\n"
					sql+="@SalesContactEmail varchar(100) = @Email,\n"
					sql+="@SalesContactCellPhone varchar(15) = @CellPhone,\n"
					sql+="@ApplyStatus tinyint = 0, --註冊中\n"
					sql+="@BrandTypeCode varchar(50),\n"
					sql+="@StoreType int,\n"
					sql+="@StoreSubType int,\n"
					sql+="@CustomerApplyID bigint,\n"
					sql+="@StoreType_TWQR int  --特店型態\n\n"
					
					sql+="---------------------------------------\n"
					sql+="select @StoreType = StoreTypeId from [ICP_Admin].[dbo].[Admin_Merchant_StoreType] WHERE StoreParentTypeId = 0 and [Status] = 1 and StoreTypeName = @StoreTypeName\n"
					sql+="select @StoreSubType = StoreTypeId from [ICP_Admin].[dbo].[Admin_Merchant_StoreType] WHERE StoreParentTypeId = @StoreType and [Status] = 1 and StoreTypeName = @StoreSubTypeName\n"
					sql+="select @BrandTypeCode = BrandTypeCode from [ICP_Admin].[dbo].[Admin_Merchant_BrandType] where Status = 1 and BrandTypeName = @BrandTypeName;\n\n\n"
		
					sql+="--新增商戶資料\n"
					sql+="INSERT INTO [dbo].[Admin_Merchant_CustomerData_Apply] ([CustomerType],[Account],[Pwd],[Template],[CommoditiyType],[ApplyStatus],[WebSiteName],[WebSiteURL],[DeliveryDayType],[PrincipalType],[IDNO],[CName],[NationalityID],[InvoiceZipCode],[InvoiceAddress],[Address_EN],[ContactEmail],[ContactCellPhone],[EinvoiceEmail],[MCCCode],[ManageEmail],[ManageCellPhone],[PayArea],[StoreTel],[StoreZipCode],[StoreAddr],[StoreType],[StoreSubType],[StoreIntro],[StoreTime],[StoreName_EN],[StoreEmail],[CreateDate],[CreateUser],[PrincipalIDNOType],[PrincipalIDNODate],[PrincipalIDNOLocation],[PrincipalBirthday],[PromoterID],[CreateSource],[RegisterStatus],[ExpiresDate],[BrandTypeCode],[SalesContactPerson],[SalesContactEmail],[SalesContactCellPhone])\n"
					sql+="VALUES (@CustomerType,@Account,@Pwd,@Template,@CommoditiyType,@ApplyStatus,@WebSiteName,@WebSiteURL,@DeliveryDayType,@PrincipalType,@IDNO,@CName,@NationalityID,@InvoiceZipCode,@InvoiceAddress,@Address_EN,@ContactEmail,@ContactCellPhone,@EinvoiceEmail,@MCCCode,@ManageEmail,@ManageCellPhone,@PayArea,@StoreTel,@StoreZipCode,@StoreAddr,@StoreType,@StoreSubType,@StoreIntro,@StoreTime,@StoreName_EN,@StoreEmail,@CreateDate,@CreateUser,@PrincipalIDNOType,@PrincipalIDNODate,@PrincipalIDNOLocation,@PrincipalBirthday,@PromoterID,@CreateSource,@RegisterStatus,@ExpiresDate,@BrandTypeCode,@SalesContactPerson,@SalesContactEmail,@SalesContactCellPhone)\n\n"
		
					sql+="SET @CustomerApplyID = SCOPE_IDENTITY()\n"
					sql+="SET @StoreType_TWQR = CASE WHEN @Template = 1 THEN 2 ELSE 1 END\n\n"
					
					sql+="INSERT INTO [dbo].[Admin_Merchant_TWQR_Temp] (CustomerID, TempType, SupportEP, AllowCreditCard, Enable, StoreType, StoreName_EN, StoreName_CH, ShortName, CreateDate, ChargeFeeRate)\n"
					sql+="VALUES (@CustomerApplyID, 3, @SupportEP, @AllowCrditCard, @Enable, @StoreType_TWQR, @StoreName_EN_TWQR, @StoreName_CH_TWQR, @ShortName, GETDATE(), 2.0)\n\n"
					
					sql+="SELECT @CustomerApplyID AS CustomerApplyId,@StoreName_EN AS StoreName\n"
					
					sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
					sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
					sql+="VALUES (@CustomerApplyID,2,'/Upload/MerchantCustomerFileApply/"+excel_data[i].特約商店英文名稱+"-2.jpg','',GETDATE(),'SYSTEM')\n\n"
			
					sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
					sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
					sql+="VALUES (@CustomerApplyID,3,'/Upload/MerchantCustomerFileApply/"+excel_data[i].特約商店英文名稱+"-3.jpg','',GETDATE(),'SYSTEM')\n\n"
			
					sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
					sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
					sql+="VALUES (@CustomerApplyID,4,'/Upload/MerchantCustomerFileApply/"+excel_data[i].特約商店英文名稱+"-4.jpg','',GETDATE(),'SYSTEM')\n\n"
			
					sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
					sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
					sql+="VALUES (@CustomerApplyID,5,'/Upload/MerchantCustomerFileApply/"+excel_data[i].特約商店英文名稱+"-5.jpg','',GETDATE(),'SYSTEM')\n\n"
					
					sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
					sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
					sql+="VALUES (@CustomerApplyID,6,'/Upload/MerchantCustomerFileApply/"+excel_data[i].特約商店英文名稱+"-6.jpg','',GETDATE(),'SYSTEM')\n\n"
					
					// sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
					// sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
					// sql+="VALUES (@CustomerApplyID,7,'/Upload/MerchantCustomerFileApply/"+excel_data[i].特約商店英文名稱+"-7.jpg','',GETDATE(),'SYSTEM')\n\n"
					
					// sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
					// sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
					// sql+="VALUES (@CustomerApplyID,8,'/Upload/MerchantCustomerFileApply/"+excel_data[i].特約商店英文名稱+"-8.jpg','',GETDATE(),'SYSTEM')\n\n"
					
					// sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
					// sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
					// sql+="VALUES (@CustomerApplyID,9,'/Upload/MerchantCustomerFileApply/"+excel_data[i].特約商店英文名稱+"-9.jpg','',GETDATE(),'SYSTEM')\n\n"
					
					// sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
					// sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
					// sql+="VALUES (@CustomerApplyID,10,'/Upload/MerchantCustomerFileApply/"+excel_data[i].特約商店英文名稱+"-10.jpg','',GETDATE(),'SYSTEM')\n\n"
					
					sql+="GO"
					
					excel_data_output.push(sql)
					user_data.push({"id":excel_data[i].身分證字號,"name":excel_data[i].負責人姓名})
					//console.log(sql)
				}
				else
				{
					if(excel_data[i].負責人姓名!=undefined)
					{
						excel_data_outputs.push(sql)
					}
				}
					
			}
			condition =true
			create_download_table(1)
		}
		catch(err)
		{
			
		}
		finally
		{
			if(!condition)
			{
				create_download_table(1)
			}
		}
		
		break;
		case 1:
		try{
			for(var i=0;i<excel_data.length;i++)
			{
			
				var IDNO_type=idno_type.indexOf((excel_data[i].補換發類別).toString().trim())+1
				var IDNO_date=(excel_data[i].發證日期).toString().replaceAll('/',"").replaceAll('-','')
				var IDNO_location=idno_location_id[idno_location.indexOf((excel_data[i].補換地點).toString().trim())]
				var Birthday=(excel_data[i].負責人生日).toString().replaceAll('/',"").replaceAll('-','')
				var IDNO=(excel_data[i].身分證字號).toString()
				var area=(excel_data[i].商店城市).toString()
				var area_detail=(excel_data[i].商店區域).toString()
				
				var zip_code=""
				
				if(area!="" && area_detail!="")
				{
					for(var j=0;j<location.length;j++)
					{
						if(location[j].area==area)
						{
							for(var k=0;k<location[j].area_detail.length;k++)
							{
								if(location[j].area_detail[k].name==area_detail)
								{
									zip_code=location[j].area_detail[k].zip
									break
								}
							}
							break;
						}
					}
				}
				
				
				var condition= (checkID(IDNO) && zip_code!="")
				
				if(condition)
				{
					var sql ="//Step1:繼續注冊Step1\n\n"
					
					sql+="var email=document.getElementById('Email')\n"
					sql+="var phone=document.getElementById('CellPhone')\n"
					sql+="var captcha=document.getElementById('txt_captcha')\n\n"
				
					sql+="email.value='"+excel_data[i].管理者信箱+"'\n"
					sql+="phone.value='"+excel_data[i].管理者手機+"'\n"
					sql+="captcha.value=$('#authcode').val()\n\n"
				
					sql+="document.getElementById('btn_loginSubmit').click()\n\n\n"
					
					
					sql+="//Step2:繼續注冊Step2\n\n"
					
					sql+="var idno=document.getElementById('IDNO')\n"
					sql+="idno.value='"+IDNO+"'\n\n"
			
					sql+="document.getElementById('btn_loginSubmit').click()\n\n\n"
					
					
					sql+="//Step3:請先執行OTP手機驗證語法\n\n\n"
					
					
					sql+="//Step4:商戶後臺資訊填寫\n\n"
					
					sql+="var acc=document.getElementById('Account')\n"
					sql+="var pwd=document.getElementById('Pwd')\n"
					sql+="var cpwd=document.getElementById('ConfirmPwd')\n"
					sql+="var country=document.getElementsByName('InvoiceCounty')[0]\n"
					sql+="var district=document.getElementsByName('InvoiceDistrict')[0]\n"
					sql+="var c_option=document.createElement('option')\n"
					sql+="var zip=document.getElementsByName('InvoiceZipCode')[0]\n\n"
			
					sql+="var address=document.getElementById('InvoiceAddress')\n"
					sql+="var en_address=document.getElementById('Address_EN')\n\n"
			
					sql+="acc.value='"+excel_data[i].登入帳號+"'\n"
					sql+="pwd.value='"+excel_data[i].密碼+"'\n"
					sql+="cpwd.value='"+excel_data[i].密碼+"'\n"
					sql+="country.value='"+excel_data[i].城市+"'\n"
					sql+="zip.value='"+zip_code+"'\n"
					sql+="c_option.value='"+excel_data[i].區域+"'\n"
					sql+="c_option.innerText='"+excel_data[i].區域+"'\n"
					sql+="district.appendChild(c_option)\n\n"
			
					sql+="district.value='"+excel_data[i].區域+"'\n"
					sql+="address.value='"+excel_data[i].聯絡地址+"'\n"
					sql+="en_address.value='"+excel_data[i].英文地址+"'\n\n"
					
					sql+="document.getElementById('btn_submit').click()\n\n\n"
					
					
					sql+="//Step5:銀行驗證\n\n\n"
					
					
					var bank_type_select=(excel_data[i].銀行種類).toString()
					

					sql+="var bank_type_id=document.getElementById('BankTypeID')\n"
					sql+="var bank_type_id_hiddden=document.getElementById('BankTypeID')\n"
					sql+="var bank_name=document.getElementById('BankName')\n"
					sql+="var bank_code=document.getElementById('BankCode')\n"
					sql+="var branch_name=document.getElementById('BranchName')\n"
					sql+="var bank_branch_code=document.getElementById('BankBranchCode')\n"
					sql+="var bank_account=document.getElementById('BankAccount')\n"
					sql+="var idno=document.getElementById('IDNumber')\n\n"

					var bti=''
					for(var j=0;j<bank_type.length;j++)
					{
						if(bank_type[j].btn==bank_type_select)
						{
							bti=bank_type[j].btnc
						}
					}

					sql+="bank_type_id.value='"+bti+"'\n"
					sql+="bank_type_id_hiddden.value='"+bti+"'\n"
					sql+="bank_name.value='"+excel_data[i].銀行代碼+" "+excel_data[i].銀行名稱+"'\n"
					sql+="bank_code.value='"+excel_data[i].銀行代碼+"'\n"
					sql+="branch_name.value='"+excel_data[i].分行代碼名稱+"'\n"
					sql+="bank_branch_code.value='"+excel_data[i].分行代碼+"'\n"
					sql+="SetValue()\n"
					sql+="idno.value='"+IDNO+"'\n"
					sql+="chkIDNumber(1)\n"
					sql+="bank_account.value='"+excel_data[i].銀行帳號+"'\n\n"

					sql+="document.getElementById('IsAgree1').click()\n"
					sql+="setTimeout(()=>{verify()},1000)"
					
					
					
					web_data_output.push(sql)
					//console.log(sql)
				}
				else
				{
					if(excel_data[i].負責人姓名!=undefined)
					{
						web_data_output.push(sql)
					}
				}
			}
			condition=true;
			create_download_table(2)
		}
		catch(err)
		{
		}
		finally
		{
			if(!condition)
			{
				create_download_table(2)
			}
		}
		break;
		case 2:
			var sql="" 
			sql+="var p55_auth_data="+JSON.stringify(user_data)+"\n\n"

			sql+="var p55_auth_data_result=[]\n\n"

			sql+="var timer\n"
			sql+="var count=0\n\n"

			sql+="function p55_auth()\n"
			sql+="{\n"
			sql+="	var id_input=document.getElementById('queryIDNO')\n"
			sql+="	var name_input=document.getElementById('queryName')\n"
			sql+="	var query_button=document.getElementById('lnkQuery')\n\n"
	
			sql+="	id_input.value=p55_auth_data[count].id\n"
			sql+="	name_input.value=p55_auth_data[count].name\n"
			sql+="	query_button.click()\n\n"
	
			sql+="	timer=setInterval(p55_result,1000)\n"
			sql+="}\n\n"

			sql+="function p55_result()\n"
			sql+="{\n"
			sql+="	var result_container=document.getElementById('queryResult')\n\n"
	
			sql+="	if(result_container.innerText.toString().trim()!='')\n"
			sql+="	{\n"
			sql+="		clearInterval(timer);\n"
			sql+="		console.log('have result')\n\n"
		
			sql+="		p55_auth_data_result.push({'id':p55_auth_data[count].id,\n"
			sql+="								   'name':p55_auth_data[count].name,\n"
			sql+="								   '驗證狀態':result_container.getElementsByTagName('table')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].innerText,\n"
			sql+="								   '身分證字號':result_container.getElementsByTagName('table')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[1].innerText,\n"
			sql+="								   '戶政司':result_container.getElementsByTagName('table')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[2].innerText,\n"
			sql+="								   '銀行間徵信':result_container.getElementsByTagName('table')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[3].innerText,\n"
			sql+="								   '電子支付機構':result_container.getElementsByTagName('table')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[4].innerText})\n\n"
		
			sql+="		result_container.getElementsByTagName('table')[0].innerText=''\n"
			sql+="		count++\n"
			sql+="		if(count != p55_auth_data.length)\n"
			sql+="		{\n"
			sql+="			p55_auth()\n"
			sql+="		}\n"
			sql+="		else\n"
			sql+="		{\n"
			sql+="			create_data_table()\n"
			sql+="		}\n"
			sql+="	}\n"
			sql+="}\n\n"

			sql+="function create_data_table()\n"
			sql+="{\n"
			sql+="	var result_table=document.getElementById('queryResult').getElementsByTagName('table')[0]\n\n"
	
			sql+="	result_table.innerText=''\n\n"
	
			sql+="	for(var i=0;i<p55_auth_data_result.length;i++)\n"
			sql+="	{\n"
			sql+="		var row=result_table.insertRow(-1)\n"
			sql+="		var cell1=row.insertCell(0)\n"
			sql+="		var cell2=row.insertCell(1)\n"
			sql+="		var cell3=row.insertCell(2)\n"
			sql+="		var cell4=row.insertCell(3)\n"
			sql+="		var cell5=row.insertCell(4)\n\n"
		
			sql+="		cell1.innerText=p55_auth_data_result[i].驗證狀態\n"
			sql+="		cell2.innerText=p55_auth_data_result[i].身分證字號\n"
			sql+="		cell3.innerText=p55_auth_data_result[i].戶政司\n"
			sql+="		cell4.innerText=p55_auth_data_result[i].銀行間徵信\n"
			sql+="		cell5.innerText=p55_auth_data_result[i].電子支付機構\n\n"
		
			sql+="		if(p55_auth_data_result[i].驗證狀態=='驗證不通過')\n"
			sql+="		{\n"
			sql+="			row.style.backgroundColor='rgba(255,0,0,0.1)'\n"
			sql+="			row.style.color='white'\n"
			sql+="			row.style.fontSize='bold'\n"
			sql+="		}\n"
			sql+="		else if(p55_auth_data_result[i].驗證狀態=='驗證通過')\n"
			sql+="		{\n"
			sql+="			row.style.backgroundColor='rgba(0,255,0,0.1)'\n"
			sql+="			row.style.color='black'\n"
			sql+="			row.style.fontSize='bold'\n"
			sql+="		}\n"
			sql+="		else"
			sql+="		{\n"
			sql+="			row.style.backgroundColor='rgba(255,0,0,0.1)'\n"
			sql+="			row.style.color='black'\n"
			sql+="			row.style.fontSize='bold'\n"
			sql+="		}\n"
			sql+="	}\n"
			sql+="}\n\n"

			sql+="p55_auth()"
			p55_auth_output=sql
			create_download_table(3)
		break;
	}
}

function filePicked(oEvent) {
    // Get The File From The Input
    var oFile = oEvent.target.files[0];
    var sFilename = oFile.name;
    // Create A File Reader HTML5
    var reader = new FileReader();

    // Ready The Event For When A File Gets Selected
    reader.onload = function(e) {
        var data = e.target.result;
        var cfb = XLS.CFB.read(data, {type: 'binary'});
        var wb = XLS.parse_xlscfb(cfb);
        // Loop Over Each Sheet
        wb.SheetNames.forEach(function(sheetName) {
            // Obtain The Current Row As CSV
            var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]);   
            var oJS = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);   

            //$("#file_output").html(sCSV);
			excel_data=oJS
			create_download_table(0)
            step(0)
        });
    };

    // Tell JS To Start Reading The File.. You could delay this if desired
    reader.readAsBinaryString(oFile);
}

function create_download_table(type,id)
{
	switch(type)
	{
		case 0:
			var table=document.createElement("table")
			var row = table.insertRow(-1)
			var cell1 = row.insertCell(0)
			var cell2 = row.insertCell(1)
			var cell3 = row.insertCell(2)
			var cell4 = row.insertCell(3)
			var cell5 = row.insertCell(4)
			
			var textarea=document.createElement("textarea")
			
			cell1.innerText="司機姓名"
			cell2.innerText="Step1:商戶進件資料下載連結"
			cell3.innerText="Step2:商戶後臺進件流程文件下載"
			cell4.innerText="照片附檔上傳確認"
			cell5.innerText="照片驗證結果"
			
			for(var i=0;i<excel_data.length;i++)
			{
			    if(excel_data[i].負責人姓名!=undefined)
				{
					var row= table.insertRow(-1)
					var cell1 = row.insertCell(0)
					var cell2 = row.insertCell(1)
					var cell3 = row.insertCell(2)
					var cell4 = row.insertCell(3)
					var cell5 = row.insertCell(4)
					
					var file_upload_1 = document.createElement("input")
					
					cell1.innerText=excel_data[i].負責人姓名
					textarea.style.resize="none"
					textarea.setAttribute('rows','1')
					textarea.setAttribute('onchange','create_img_sql(this)')
					
					file_upload_1.type="file"
					file_upload_1.setAttribute('multiple','')
					

					file_upload_1.addEventListener('change',(event) =>
					{
						img_check(event.target.files,0,event)
					})
					
					cell4.appendChild(file_upload_1)
				}
			}
			document.getElementById("table1").appendChild(table)
		break;
		case 1:
			var table=document.getElementById("table1")
			
			for(var i=0;i<excel_data_output.length;i++)
			{
				var cell=table.getElementsByTagName("tr")[i+1].getElementsByTagName("td")[1].appendChild(download(1,i,"Step1_新增商戶資訊"+"("+excel_data[i].負責人姓名.toString().substring(0,1)+"O"+excel_data[i].負責人姓名.toString().substring(2,3)+")"))
				
				for(var j=0;j<bank_auth_output.length;j++)
				{
					if(table.getElementsByTagName("tr")[i+1].getElementsByTagName("td")[0].innerText==bank_auth_output[j].user)
					{
						if(bank_auth_output[j].rtn_code=='1')
						{
							console.log(table.getElementsByTagName("tr")[i+1])
							table.getElementsByTagName("tr")[i+1].style.backgroundColor="rgba(0,255,0,0.1)"
						}
						else
						{
							table.getElementsByTagName("tr")[i+1].style.backgroundColor="rgba(255,0,0,0.1)"
						}
					}
				}
			}
			
			step(1)
		break;
		case 2:
			var table=document.getElementById("table1")
			
			for(var i=0;i<web_data_output.length;i++)
			{
				var cell=table.getElementsByTagName("tr")[i+1].getElementsByTagName("td")[2].appendChild(download(2,i,"Step2_商戶後臺進件流程"+"("+excel_data[i].負責人姓名.toString().substring(0,1)+"O"+excel_data[i].負責人姓名.toString().substring(2,3)+")"))
			}
			step(2)
		break;
		case 3:
			var download_button=document.getElementById("p55_auth_download")
			
			download_button.innerText=""
			download_button.appendChild(download(3,0,"P55_驗證檔案"))
		break;	
		case 4:
			var input=document.getElementById("table1").getElementsByTagName("tr")[id].getElementsByTagName("textarea")[0].parentNode
			
			input.appendChild(download(4,0,input.parentNode.getElementsByTagName("td")[0].innerText+"_圖檔上傳"))
	}
}

function checkID(idStr){
  // 依照字母的編號排列，存入陣列備用。
  var letters = new Array('A', 'B', 'C', 'D', 
      'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
      'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 
      'X', 'Y', 'W', 'Z', 'I', 'O');
  // 儲存各個乘數
  var multiply = new Array(1, 9, 8, 7, 6, 5, 
                           4, 3, 2, 1);
  var nums = new Array(2);
  var firstChar;
  var firstNum;
  var lastNum;
  var total = 0;
  // 撰寫「正規表達式」。第一個字為英文字母，
  // 第二個字為1或2，後面跟著8個數字，不分大小寫。
  
  var regExpID=/^[a-z](1|2)\d{8}$/i; 
  // 使用「正規表達式」檢驗格式
  if (idStr.search(regExpID)==-1) {
    // 基本格式錯誤
	alert("請仔細填寫身份證號碼");
   return false;
  } else {
	// 取出第一個字元和最後一個數字。
	firstChar = idStr.charAt(0).toUpperCase();
	lastNum = idStr.charAt(9);
  }
  // 找出第一個字母對應的數字，並轉換成兩位數數字。
  for (var i=0; i<26; i++) {
	if (firstChar == letters[i]) {
	  firstNum = i + 10;
	  nums[0] = Math.floor(firstNum / 10);
	  nums[1] = firstNum - (nums[0] * 10);
	  break;
	} 
  }
  // 執行加總計算
  for(var i=0; i<multiply.length; i++){
    if (i<2) {
      total += nums[i] * multiply[i];
    } else {
      total += parseInt(idStr.charAt(i-1)) * 
               multiply[i];
    }
  }
  // 和最後一個數字比對
  if ((10 - (total % 10)) % 10!= lastNum) {
	alert("身份證號碼寫錯了！");
	return false;
  } 
  return true;
}

function download(step,id,filename)
{
	var element = document.createElement('a');
	
	switch(step)
	{
		case 1:
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(excel_data_output[id]));
			element.setAttribute('download', filename);
	
			element.innerText=filename+"下載"
		break;
		case 2:
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(web_data_output[id]));
			element.setAttribute('download', filename);
	
			element.innerText=filename+"下載"
		break;
		case 3:
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(p55_auth_output));
			element.setAttribute('download', filename);
	
			element.innerText=filename+"下載"
		break;
		case 4:
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(img_ins));
			element.setAttribute('download', filename);
	
			element.innerText=filename+"下載"
		break;
	}
    
	return element
}

function file_download(type)
{
	var table=document.getElementById("table1")
	
	if(type<=1)
	{
		for(var i=1;i<table.getElementsByTagName('tr').length;i++)
		{
			//console.log(table.getElementsByTagName('tr')[i].getElementsByTagName('a')[type])
			setInterval(table.getElementsByTagName('tr')[i].getElementsByTagName('a')[type].click(),1000)
		}
	}
	else
	{
		switch(type)
		{
			case 2:
				for(var i=1;i<table.getElementsByTagName('tr').length;i++)
				{
					table.getElementsByTagName('tr')[i].getElementsByTagName('td')[3].getElementsByTagName('a')[0].click()
				}
			break;
			case 3:
				for(var i=1;i<table.getElementsByTagName('tr').length;i++)
				{
					for(var j=3;j<table.getElementsByTagName('tr')[i].getElementsByTagName('a').length;j++)
					{
						table.getElementsByTagName('tr')[i].getElementsByTagName('j')[type].click()
					}
				}
			break;
		}
	}
}

function generateUUID() {
var d = new Date().getTime();
var uuid = '4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  var r = (d + Math.random()*16)%16 | 0;
  d = Math.floor(d/16);
  return (c=='x' ? r : (r&0x3|0x8)).toString(16);
});
return uuid;
};

function imageToBase64(file)
{
	return new Promise((resolve, reject) =>{
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result)
		reader.onerror = reject
		reader.readAsDataURL(file);
	});
}

function img_check(file,type)
{
	var input = event.srcElement
	var container = input.parentNode
	var row=container.parentNode
	var file_size=10485760
	
	var file_status=[]
	var all_file_status=true

	if(file.length==5)
	{
		for(var j=0;j<file.length;j++)
		{
			var condition=false
			for(var i=0;i<5;i++)
			{
				var file_name=excel_data[row.rowIndex-1].商店英文名稱+"-"+(i+2)
				if(file[j].name.toString().indexOf(file_name)>-1)
				{
					if(file[j].size<=file_size && file[j].type=='image/jpeg')
					{
						file_status.push({'file_name':file_name,'rtn_code':'1','rtn_msg':'成功'})
						
						condition=true
					}
					if(file[j].size>file_size)
					{
						file_status.push({'file_name':file_name,'rtn_code':'0','rtn_msg':'檔案超過10MB'})
						all_file_status=false
						condition=true
					}
					if(file[j].type!='image/jpeg')
					{
						file_status.push({'file_name':file_name,'rtn_code':'0','rtn_msg':'格式不爲.jpeg'})
						all_file_status=false
						condition=true
					}
					
					if(condition)
					{
						break;
					}
				}
			}
			
			if(!condition)
			{
				file_status.push({'file_name':file[j].name,'rtn_code':'0','rtn_msg':'不符合檔名規則'})
			}
		}
	}
	
	row.getElementsByTagName('td')[4].innerHTML="檔案1："+file_status[0].file_name+"("+file_status[0].rtn_msg+")<br/>"
	row.getElementsByTagName('td')[4].innerHTML+="檔案2："+file_status[1].file_name+"("+file_status[1].rtn_msg+")<br/>"
	row.getElementsByTagName('td')[4].innerHTML+="檔案3："+file_status[2].file_name+"("+file_status[2].rtn_msg+")<br/>"
	row.getElementsByTagName('td')[4].innerHTML+="檔案4："+file_status[3].file_name+"("+file_status[3].rtn_msg+")<br/>"
	row.getElementsByTagName('td')[4].innerHTML+="檔案5："+file_status[4].file_name+"("+file_status[4].rtn_msg+")<br/>"
	row.getElementsByTagName('td')[4].innerHTML+="檔案6："+file_status[5].file_name+"("+file_status[5].rtn_msg+")<br/>"
	row.getElementsByTagName('td')[4].innerHTML+="檔案7："+file_status[6].file_name+"("+file_status[6].rtn_msg+")<br/>"
	row.getElementsByTagName('td')[4].innerHTML+="檔案8："+file_status[7].file_name+"("+file_status[7].rtn_msg+")<br/>"
	row.getElementsByTagName('td')[4].innerHTML+="檔案9："+file_status[8].file_name+"("+file_status[8].rtn_msg+")<br/>"
	if(!all_file_status)
	{
		row.getElementsByTagName('td')[4].style.backgroundColor="rgba(255,255,0,0.5)"
	}
}

function create_img_sql(element)
{
	var row = element.parentNode.parentNode
	var file = row.getElementsByTagName('a')
	
	//console.log(file.length)
	if(file.length==11)
	{
		var sql=""
		
		sql+=""
		
		sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
		sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
		sql+="VALUES ("+element.value+",2,'/Upload/MerchantCustomerFileApply/"+file[2].download+".jpeg','',GETDATE(),'SYSTEM')\n\n"

		sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
		sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
		sql+="VALUES ("+element.value+",3,'/Upload/MerchantCustomerFileApply/"+file[3].download+".jpeg','',GETDATE(),'SYSTEM')\n\n"

		sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
		sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
		sql+="VALUES ("+element.value+",4,'/Upload/MerchantCustomerFileApply/"+file[4].download+".jpeg','',GETDATE(),'SYSTEM')\n\n"

		sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
		sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
		sql+="VALUES ("+element.value+",5,'/Upload/MerchantCustomerFileApply/"+file[5].download+".jpeg','',GETDATE(),'SYSTEM')\n\n"
		
		sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
		sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
		sql+="VALUES ("+element.value+",6,'/Upload/MerchantCustomerFileApply/"+file[6].download+".jpeg','',GETDATE(),'SYSTEM')\n\n"
		
		sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
		sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
		sql+="VALUES ("+element.value+",7,'/Upload/MerchantCustomerFileApply/"+file[7].download+".jpeg','',GETDATE(),'SYSTEM')\n\n"
		
		sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
		sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
		sql+="VALUES ("+element.value+",8,'/Upload/MerchantCustomerFileApply/"+file[8].download+".jpeg','',GETDATE(),'SYSTEM')\n\n"
		
		sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
		sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
		sql+="VALUES ("+element.value+",9,'/Upload/MerchantCustomerFileApply/"+file[9].download+".jpeg','',GETDATE(),'SYSTEM')\n\n"
		
		sql+="INSERT INTO  ICP_Admin.dbo.Admin_Merchant_FileUpload_Apply\n"
		sql+="([CustomerApplyID],[DocumentType],[FilePath],[Note],[CreateDate],[CreateUser])\n"
		sql+="VALUES ("+element.value+",10,'/Upload/MerchantCustomerFileApply/"+file[10].download+".jpeg','',GETDATE(),'SYSTEM')\n\n"
		
		sql+="UPDATE ICP_Admin.dbo.Admin_Merchant_CustomerData_Apply\n"
		sql+="SET RegisterStatus=100 ,ApplyStatus = 1\n"
		sql+="WHERE CustomerApplyID='"+element.value+"'"
		
		img_ins=sql
		create_download_table(4,row.rowIndex)
	}
}

function check_bank(bank_code,bank_branch_code)
{
	var rtn_data={'rtn_code':'0','rtn_msg':'查無其銀行或分行'}
	var bank_bc=bank_code+bank_branch_code
	for(var i=0;i<bank.length;i++)
	{
		if(bank_code==bank[i].機構代碼)
		{
			if(bank[i].驗證!=1)
			{
				rtn_data.rtn_code="01"
				rtn_data.rtn_msg=bank[i].機構名稱+"不支援驗證"
				
				return rtn_data
			}else if(bank[i].提領!=1)
			{
				rtn_data.rtn_code="02"
				rtn_data.rtn_msg=bank[i].機構名稱+"不支援提領"
				
				return rtn_data
			}
			else
			{
				for(var j=0;j<bank_detail.length;j++)
				{
					if(bank_detail[j].機構代碼==bank_bc)
					{
						if(bank_detail[j].驗證!=1)
						{
							rtn_data.rtn_code="03"
							rtn_data.rtn_msg=bank[i].機構名稱+"("+bank_detail[j].機構名稱+")不支援驗證"
							
							return rtn_data
						}else if(bank_detail[j].提領!=1)
						{
							rtn_data.rtn_code="04"
							rtn_data.rtn_msg=bank[i].機構名稱+"("+bank_detail[j].機構名稱+")不支援提領"
							
							return rtn_data
						}
						else if(bank_detail[j].驗證==1 && bank_detail[j].提領==1)
						{
							rtn_data.rtn_code="1"
							rtn_data.rtn_msg="成功"
							
							return rtn_data
						}
					}
				}
			}
		}
	}
	return rtn_data
}