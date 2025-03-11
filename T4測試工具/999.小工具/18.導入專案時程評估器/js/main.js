var calendar_data=[]
var waiting_data
var searching_year=[]
var default_setting={
						"s1":2, //判定報告及報表製作
						"s2":2, //整測資料確認
						"S3":1, //整測提領天期
						"s4":1, //整測撥款天期
						"s5":7, //整測天期（預計）
					}
var project_schedule=[]
var calendar_status=[]


window.onload=function(){
	fetch_calendar_data()
}


function fetch_calendar_data()
{
	var today= new Date()
	var today_year =today.getFullYear()
	var previous_year=today_year-1

	for(var i=0 ; i<3 ;i++)
	{
		searching_year.push(previous_year+i)
		
		if(i==2)
		{
			FetchData(previous_year+i)
		}
		else
		{
			FetchData(previous_year+i)
		}
	}
	
	waiting_data=setInterval(waiting_calendar_data,1000)
}

async function FetchData(year)
{
	try {
			const  response = await fetch('https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/'+year+'.json');
			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}
			const data = await response.json();
			var insert_data ={
								'Year':year,
								'calendar':data
								}
			calendar_data.push(insert_data)
			calendar_status.push({"year":year,"status":"done"})
		} 
		catch (error) {
			console.error('There has been a problem with your fetch operation:', error);
			calendar_status.push({"year":year,"status":"fail"})
		}
		finally
		{
		
		}
}

function waiting_calendar_data()
{
	if(calendar_status.length==3)
	{
		clearInterval(waiting_data)
		create_calendar()
	}
}
function create_calendar()
{
	document.getElementById('calendar_table').getElementsByTagName('td')[0].innerHTML=""
	calendar_data.sort((a,b)=>a.Year - b.Year)
	for(var i=0;i<calendar_data.length;i++)
	{
		var insert_calendar_data=calendar_data[i]
		var outer_container =document.createElement('div')
		outer_container.style.display="flex"
		outer_container.style.flexDirection='column'
		
		var year_container = document.createElement('div')
		var calendar_container = document.createElement('div')
		
		var year = document.createElement('span')
		
		year.innerText= calendar_data[i].Year
		
		year_container.appendChild(year)
		outer_container.appendChild(year_container)
		outer_container.id=calendar_data[i].Year
		for(var j=0;j<3;j++)
		{
			var month_calendar=document.createElement('div')
			month_calendar.style.display="flex"
			month_calendar.style.flexDirection="row"
			
			for(var k=0;k<4;k++)
			{
				var table=document.createElement('table')
				var row = table.insertRow(-1)
				var cell1 =row.insertCell(0)
				var month=((j*4)+(k)+1)

				for(var m=0;m<2;m++)
				{
					if(month.toString().length<2)
					{
						month="0"+month
					}
				}
				

				cell1.innerText=month+"月"
				cell1.setAttribute('colspan','7')
				table.id=calendar_data[i].Year.toString()+month
				for(var l=0;l<7;l++)
				{	
					row=table.insertRow(-1)
					var cell1=row.insertCell(0)
						var cell2=row.insertCell(1)
						var cell3=row.insertCell(2)
						var cell4=row.insertCell(3)
						var cell5=row.insertCell(4)
						var cell6=row.insertCell(5)
						var cell7=row.insertCell(6)
						
					if(l==0)
					{
						cell1.innerText='日'
						cell2.innerText='一'
						cell3.innerText='二'
						cell4.innerText='三'
						cell5.innerText='四'
						cell6.innerText='五'
						cell7.innerText='六'
					}
				}
				
			    var index_start=calendar_data[i].calendar.findIndex(item=>item.date.startsWith(calendar_data[i].Year.toString()+month))
				var index_end=calendar_data[i].calendar.findLastIndex(item=>item.date.startsWith(calendar_data[i].Year.toString()+month))
				
				
				for(var n=2;n<table.getElementsByTagName('tr').length;n++)
				{
					for(var o=0;o<table.getElementsByTagName('tr')[n].getElementsByTagName('td').length;o++)
					{
						var week=['日','一','二','三','四','五','六']
						if(calendar_data[i].calendar[index_start]!=undefined && calendar_data[i].calendar[index_start].week==week[o])
						{
							if(index_start<=index_end)
							{ 
								var today =new Date()
								var today_year=today.getFullYear().toString()
								var today_month=today.getMonth().toString()
								var today_date=today.getDate().toString()
								
								for(var p=0;p<2;p++)
								{
									if(today_month.length<2)
									{
										today_month="0"+today_month
									}
									if(today_date.length<2)
									{
										today_date="0"+today_date
									}
								}
								
								var today_arr= findDateIndex(today_year.toString(),(today_year+today_month+today_date).toString())
								
								table.getElementsByTagName('tr')[n].getElementsByTagName('td')[o].innerHTML=parseInt(calendar_data[i].calendar[index_start].date.substring(6,8))
								if(calendar_data[i].calendar[index_start].toString()>(today_year+today_month+today_date).toString())
								{
										table.getElementsByTagName('tr')[n].getElementsByTagName('td')[o].setAttribute("onclick","set_schedule(this)")
								}
								if(calendar_data[i].calendar[index_start].description!="")
								{
									table.getElementsByTagName('tr')[n].getElementsByTagName('td')[o].title=calendar_data[i].calendar[index_start].description
								}
								if(calendar_data[i].calendar[index_start].isHoliday)
								{
									table.getElementsByTagName('tr')[n].getElementsByTagName('td')[o].style.backgroundColor="rgba(0,255,0,0.5)"
								}
								index_start++
							}
						}
					}
					
					if(n==(table.getElementsByTagName('tr').length-1))
					{
						var condition=false
						for(var o=0;o<table.getElementsByTagName('tr')[n].getElementsByTagName('td').length;o++)
						{
							if(table.getElementsByTagName('tr')[n].getElementsByTagName('td')[o].innerText!="")
							{
								condition=true
							}
						}
						
						if(!condition)
						{
							table.deleteRow(-1)
						}
					}
				}
				
				month_calendar.appendChild(table)
			}
			calendar_container.appendChild(month_calendar)
		}
		outer_container.appendChild(calendar_container)
		document.getElementById('calendar_table').getElementsByTagName('td')[0].appendChild(outer_container)
	}
}

function findDateIndex(year, targetDate) {
    for (let i = 0; i < calendar_data.length; i++) {
        if (calendar_data[i].Year.toString() === year) {
            for (let j = 0; j < calendar_data[i].calendar.length; j++) {
                if (calendar_data[i].calendar[j].date === targetDate) {
                    return [i, j];
                }
            }
        }
    }
    return -1; // 如果未找到，返回 -1
}

function set_schedule(e)
{	
	create_calendar()
	
	var year  = e.parentNode.parentNode.parentNode.id.toString().substring(0,4)
	var month = e.parentNode.parentNode.parentNode.id.toString().substring(4,6)
	var date  = e.innerText
	
	
	//----------參數設定----------
	var condition1 = document.getElementById("condition0").getElementsByTagName("select")[0].value//正式環境設定
	var condition2 = document.getElementById("condition1").getElementsByTagName("select")[0].value//正式環境撥款設定
	var condition3 = document.getElementById("condition2").getElementsByTagName("select")[0].value//正式環境提領設定
	var condition4 = "1"//報表製作設定
	var condition5 = "6"//UAT整測
	var condition6 = "2"//Pilot Run
	
	//----------日期結果----------
	var release_date=findDateIndex(year.toString(),(year+month+date).toString())
	
	for (var i=0;i<2;i++)
	{
		if(date.length!=2)
		{
			date="0"+date
		}
		if(month.length!=2)
		{
			month="0"+month
		}
	}
	// console.clear()
	// console.log("選擇年：",year)
	// console.log("選擇日期：",year+month+date)
	// console.log("選擇日期Index：",findDateIndex(year.toString(),(year+month+date).toString()))
	
	// console.log("正式環境設定所需時間：",condition1)
	// console.log("正式環境撥款天期：",condition2)
	// console.log("正式環境提領天期：",condition3)
	// console.log("正式環境報告及報表製作天期：",condition4)
	// console.log("----------------------------------------")
	// console.log("Pilot判定+業務上缐：",year+month+date)
	
	var condition4_result_date_show=date_count(year+month+date,condition4,1)
	
	var condition3_result_date_show=date_count(condition4_result_date_show.start,condition3,1)
	
	var condition2_result_date_show=date_count(condition3_result_date_show.start,condition2-1,1)
	
	var pilot_run_date_show=date_count(condition2_result_date_show.start,condition6,1)

	var condition1_result_date_show=date_count(pilot_run_date_show.start,condition1-1,1)
	
	var uat_date= date_count(condition1_result_date_show.start,condition5,1)
	
	var condition5 = date_count(uat_date.end,2,1)
	// console.log("正式環境報告及報表製作：",condition4_result_date_show.start+"-"+condition4_result_date_show.end)
	// console.log("正式環境提領：",condition3_result_date_show.end)
	// console.log("正式環境撥款：",+condition2_result_date_show.end)
	// console.log("pilot run：",pilot_run_date_show.start+"-"+pilot_run_date_show.end)
	// console.log("正式環境設定及一元交易退款驗測：",condition1_result_date_show.start+"-"+condition1_result_date_show.end)
	// console.log("uat整測",uat_date.start+"-"+uat_date.end)
	// document.getElementById('calendar_table').getElementsByTagName('td')[0].innerText=""
	create_calendar()
	
	project_schedule=[]
	project_schedule.uat_start = uat_date.start
	project_schedule.uat_end = uat_date.end
	project_schedule.prod_set_start = condition1_result_date_show.start
	project_schedule.prod_set_end = condition1_result_date_show.end
	project_schedule.pilot_run_start = pilot_run_date_show.start
	project_schedule.pilot_run_end = pilot_run_date_show.end
	project_schedule.allocate = condition2_result_date_show.end
	project_schedule.withdraw = condition3_result_date_show.end
	project_schedule.report_start = condition4_result_date_show.start
	project_schedule.report_end = condition4_result_date_show.end
	project_schedule.release_report = year+month+date
	project_schedule.form = condition5.start
	
	project_schedule_show()
}


function date_count(date,days,type)
{
	var result=[]
	var date_now =date
	if(days>-1)
	{
		for(var i=1 ;i>0;i--)
		{
			var date = subtractDays(date_now,1)
			var year = date.getFullYear().toString()
			var month = (date.getMonth()+1).toString()
			var day = date.getDate().toString()
			
			for( var j=0;j<2;j++)
			{
				if(month.length!=2)
				{
					month="0"+month
				}
				if(day.length!=2)
				{
					day="0"+day
				}
			}
			date_now = year+month+day
			
			var calendar_index = findDateIndex(date_now.substring(0,4),date_now)
			
			if(calendar_data[calendar_index[0]].calendar[calendar_index[1]].isHoliday)
			{
				i++
			}
		}
		
	}	
	switch(type)
	{
		case 0:
			result.end = date_now
			result.start = date_now
		break;
		case 1:
			result.end = date_now
			
			if(days==0)
			{
				result.start = date_now
			}
			else
			{
				for(var i=days ;i>0;i--)
				{
					var date = subtractDays(date_now,1)
					var year = date.getFullYear().toString()
					var month = (date.getMonth()+1).toString()
					var day = date.getDate().toString()
					
					for( var j=0;j<2;j++)
					{
						if(month.length!=2)
						{
							month="0"+month
						}
						if(day.length!=2)
						{
							day="0"+day
						}
					}
					date_now = year+month+day
					
					var calendar_index = findDateIndex(date_now.substring(0,4),date_now)
					
					if(calendar_data[calendar_index[0]].calendar[calendar_index[1]].isHoliday)
					{
						i++
					}
				}
				result.start = date_now
			}
	}
	return result
}
function addDays(date, days) {
    let result = new Date(date.substring(0,4)+"-"+date.substring(4,6)+"-"+date.substring(6,8));
    result.setDate(result.getDate() + days);
    return result;
}

function subtractDays(date, days) {
    let result = new Date(date.substring(0,4)+"-"+date.substring(4,6)+"-"+date.substring(6,8));
    result.setDate(result.getDate() - days);
    return result;
}

function project_schedule_show()
{
	var uat_schedule=[]
	uat_schedule.start=findDateIndex(project_schedule.uat_start.substring(0,4),project_schedule.uat_start)
	uat_schedule.end=findDateIndex(project_schedule.uat_end.substring(0,4),project_schedule.uat_end)

	
	for(var i=uat_schedule.start[0];i<uat_schedule.end[0]+1;i++)
	{
		for(var j=uat_schedule.start[1];j<uat_schedule.end[1]+1;j++)
		{
			var table = document.getElementById(calendar_data[i].calendar[j].date.toString().substring(0,6))
			
			for(var k=7;k<table.getElementsByTagName("td").length;k++)
			{
				var date = table.getElementsByTagName("td")[k].innerText
				
				for(var l=0;l<2;l++)
				{
					if(date.toString().length!=2)
					{
						date="0"+date
					}
				}
				if(date == calendar_data[i].calendar[j].date.toString().substring(6,8))
				{
					if(table.getElementsByTagName("td")[k].style.backgroundColor=="")
					{
						table.getElementsByTagName("td")[k].title="UAT整測"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,255,0,0.5)"
					}
					else if(table.getElementsByTagName("td")[k].style.backgroundColor!=""  && table.getElementsByTagName("td")[k].title!="")
					{
						table.getElementsByTagName("td")[k].title+="+UAT整測"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,255,0,0.5)"
					}
				}
			}
		}
	}
	var form_schedule =[]
	form_schedule.start=findDateIndex(project_schedule.form.substring(0,4),project_schedule.form)
	form_schedule.end=findDateIndex(project_schedule.form.substring(0,4),project_schedule.form)
	for(var i=form_schedule.start[0];i<form_schedule.end[0]+1;i++)
	{
		for(var j=form_schedule.start[1];j<form_schedule.end[1]+1;j++)
		{
			var table = document.getElementById(calendar_data[i].calendar[j].date.toString().substring(0,6))
			
			for(var k=7;k<table.getElementsByTagName("td").length;k++)
			{
				var date = table.getElementsByTagName("td")[k].innerText
				
				for(var l=0;l<2;l++)
				{
					if(date.toString().length!=2)
					{
						date="0"+date
					}
				}
				if(date == calendar_data[i].calendar[j].date.toString().substring(6,8))
				{
					if(table.getElementsByTagName("td")[k].style.backgroundColor=="")
					{
						table.getElementsByTagName("td")[k].title="正式環境商戶過件"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(0,255,207,0.5)"
					}
					else if(table.getElementsByTagName("td")[k].style.backgroundColor!=""  && table.getElementsByTagName("td")[k].title!="")
					{
						table.getElementsByTagName("td")[k].title+="+正式環境商戶過件"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(0,255,207,0.5)"
					}
				}
			}
		}
	}
	
	
	var prod_set_schedule=[]
	prod_set_schedule.start=findDateIndex(project_schedule.prod_set_start.substring(0,4),project_schedule.prod_set_start)
	prod_set_schedule.end=findDateIndex(project_schedule.prod_set_end.substring(0,4),project_schedule.prod_set_end)
	
	for(var i=prod_set_schedule.start[0];i<prod_set_schedule.end[0]+1;i++)
	{
		for(var j=prod_set_schedule.start[1];j<prod_set_schedule.end[1]+1;j++)
		{
			var table = document.getElementById(calendar_data[i].calendar[j].date.toString().substring(0,6))
			
			for(var k=7;k<table.getElementsByTagName("td").length;k++)
			{
				var date = table.getElementsByTagName("td")[k].innerText
				
				for(var l=0;l<2;l++)
				{
					if(date.toString().length!=2)
					{
						date="0"+date
					}
				}
				if(date == calendar_data[i].calendar[j].date.toString().substring(6,8))
				{
					if(table.getElementsByTagName("td")[k].style.backgroundColor=="")
					{
						table.getElementsByTagName("td")[k].title="正式環境設定"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,174,0,0.5)"
					}
					else if(table.getElementsByTagName("td")[k].style.backgroundColor!=""  && table.getElementsByTagName("td")[k].title!="")
					{
						table.getElementsByTagName("td")[k].title+="+正式環境設定"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,174,0,0.5)"
					}
				}
			}
		}
	}
	
	var pilot_run_schedule=[]
	pilot_run_schedule.start=findDateIndex(project_schedule.pilot_run_start.substring(0,4),project_schedule.pilot_run_start)
	pilot_run_schedule.end=findDateIndex(project_schedule.pilot_run_end.substring(0,4),project_schedule.pilot_run_end)
	
	for(var i=pilot_run_schedule.start[0];i<pilot_run_schedule.end[0]+1;i++)
	{
		for(var j=pilot_run_schedule.start[1];j<pilot_run_schedule.end[1]+1;j++)
		{
			var table = document.getElementById(calendar_data[i].calendar[j].date.toString().substring(0,6))
			
			for(var k=7;k<table.getElementsByTagName("td").length;k++)
			{
				var date = table.getElementsByTagName("td")[k].innerText
				
				for(var l=0;l<2;l++)
				{
					if(date.toString().length!=2)
					{
						date="0"+date
					}
				}
				if(date == calendar_data[i].calendar[j].date.toString().substring(6,8))
				{
					if(table.getElementsByTagName("td")[k].style.backgroundColor=="")
					{
						table.getElementsByTagName("td")[k].title="正式環境Pilot Run"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,0,0,0.5)"
					}
					else if(table.getElementsByTagName("td")[k].style.backgroundColor!=""  && table.getElementsByTagName("td")[k].title!="")
					{
						table.getElementsByTagName("td")[k].title+="+正式環境Pilot Run"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,0,0,0.5)"
					}
				}
			}
		}
	}
	
	
	var allocate_schedule=[]
	allocate_schedule.start=findDateIndex(project_schedule.allocate.substring(0,4),project_schedule.allocate)
	allocate_schedule.end=findDateIndex(project_schedule.allocate.substring(0,4),project_schedule.allocate)
	
	for(var i=allocate_schedule.start[0];i<allocate_schedule.end[0]+1;i++)
	{
		for(var j=allocate_schedule.start[1];j<allocate_schedule.end[1]+1;j++)
		{
			var table = document.getElementById(calendar_data[i].calendar[j].date.toString().substring(0,6))
			
			for(var k=7;k<table.getElementsByTagName("td").length;k++)
			{
				var date = table.getElementsByTagName("td")[k].innerText
				
				for(var l=0;l<2;l++)
				{
					if(date.toString().length!=2)
					{
						date="0"+date
					}
				}
				if(date == calendar_data[i].calendar[j].date.toString().substring(6,8))
				{
					if(table.getElementsByTagName("td")[k].style.backgroundColor=="")
					{
						table.getElementsByTagName("td")[k].title="撥款確認"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,0,50,0.5)"
					}
					else if(table.getElementsByTagName("td")[k].style.backgroundColor!=""  && table.getElementsByTagName("td")[k].title!="")
					{
						table.getElementsByTagName("td")[k].title+="+撥款確認"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,0,50,0.5)"
					}
				}
			}
		}
	}
	
	var withdraw_schedule=[]
	withdraw_schedule.start=findDateIndex(project_schedule.withdraw.substring(0,4),project_schedule.withdraw)
	withdraw_schedule.end=findDateIndex(project_schedule.withdraw.substring(0,4),project_schedule.withdraw)
	
	for(var i=withdraw_schedule.start[0];i<withdraw_schedule.end[0]+1;i++)
	{
		for(var j=withdraw_schedule.start[1];j<withdraw_schedule.end[1]+1;j++)
		{
			var table = document.getElementById(calendar_data[i].calendar[j].date.toString().substring(0,6))
			
			for(var k=7;k<table.getElementsByTagName("td").length;k++)
			{
				var date = table.getElementsByTagName("td")[k].innerText
				
				for(var l=0;l<2;l++)
				{
					if(date.toString().length!=2)
					{
						date="0"+date
					}
				}
				if(date == calendar_data[i].calendar[j].date.toString().substring(6,8))
				{
					if(table.getElementsByTagName("td")[k].style.backgroundColor=="")
					{
						table.getElementsByTagName("td")[k].title="提領確認"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,0,50,0.8)"
					}
					else if(table.getElementsByTagName("td")[k].style.backgroundColor!=""  && table.getElementsByTagName("td")[k].title!="")
					{
						table.getElementsByTagName("td")[k].title+="+提領確認"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,0,50,0.8)"
					}
				}
			}
		}
	}
	
	var report_schedule=[]
	report_schedule.start=findDateIndex(project_schedule.report_start.substring(0,4),project_schedule.report_start)
	report_schedule.end=findDateIndex(project_schedule.report_end.substring(0,4),project_schedule.report_end)
	
	for(var i=report_schedule.start[0];i<report_schedule.end[0]+1;i++)
	{
		for(var j=report_schedule.start[1];j<report_schedule.end[1]+1;j++)
		{
			var table = document.getElementById(calendar_data[i].calendar[j].date.toString().substring(0,6))
			
			for(var k=7;k<table.getElementsByTagName("td").length;k++)
			{
				var date = table.getElementsByTagName("td")[k].innerText
				
				for(var l=0;l<2;l++)
				{
					if(date.toString().length!=2)
					{
						date="0"+date
					}
				}
				if(date == calendar_data[i].calendar[j].date.toString().substring(6,8))
				{
					if(table.getElementsByTagName("td")[k].style.backgroundColor=="")
					{
						table.getElementsByTagName("td")[k].title="報告整理"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,100,255,0.8)"
					}
					else if(table.getElementsByTagName("td")[k].style.backgroundColor!=""  && table.getElementsByTagName("td")[k].title!="")
					{
						table.getElementsByTagName("td")[k].title+="+報告整理"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(255,100,255,0.8)"
					}
				}
			}
		}
	}
	
	var release_schedule=[]
	release_schedule.start=findDateIndex(project_schedule.release_report.substring(0,4),project_schedule.release_report)
	release_schedule.end=findDateIndex(project_schedule.release_report.substring(0,4),project_schedule.release_report)
	
	for(var i=release_schedule.start[0];i<release_schedule.end[0]+1;i++)
	{
		for(var j=release_schedule.start[1];j<release_schedule.end[1]+1;j++)
		{
			var table = document.getElementById(calendar_data[i].calendar[j].date.toString().substring(0,6))
			
			for(var k=7;k<table.getElementsByTagName("td").length;k++)
			{
				var date = table.getElementsByTagName("td")[k].innerText
				
				for(var l=0;l<2;l++)
				{
					if(date.toString().length!=2)
					{
						date="0"+date
					}
				}
				if(date == calendar_data[i].calendar[j].date.toString().substring(6,8))
				{
					if(table.getElementsByTagName("td")[k].style.backgroundColor=="")
					{
						table.getElementsByTagName("td")[k].title="Pilot判定+業務上缐"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(29, 111, 22, 0.81)"
					}
					else if(table.getElementsByTagName("td")[k].style.backgroundColor!=""  && table.getElementsByTagName("td")[k].title!="")
					{
						table.getElementsByTagName("td")[k].title+="+Pilot判定+業務上缐"
						table.getElementsByTagName("td")[k].style.backgroundColor="rgba(29, 111, 22, 0.81)"
					}
				}
			}
		}
	}
	
	
	var schedule_show= document.getElementById("calendar_memo")
	
	var new_table = document.createElement('table')
	var row=new_table.insertRow(-1)
	var column1 = row.insertCell(0)
	
	column1.innerText =  "特店導入專案時程評估"
	column1.setAttribute("colspan","2")
	
	
	row=new_table.insertRow(-1)
	column1 = row.insertCell(0)
	var	column2 = row.insertCell(1)
	
	column1.innerText="UAT整測時間      ："
	column2.innerText=project_schedule.uat_start.substring(0,4)+"/"+project_schedule.uat_start.substring(4,6)+"/"+project_schedule.uat_start.substring(6,8)+"-"+project_schedule.uat_end.substring(0,4)+"/"+project_schedule.uat_end.substring(4,6)+"/"+project_schedule.uat_end.substring(6,8)
	
	row=new_table.insertRow(-1)
	column1 = row.insertCell(0)
	column2 = row.insertCell(1)
	
	column1.innerText="正式環境商戶過件 ："
	column2.innerText=project_schedule.form.substring(0,4)+"/"+project_schedule.form.substring(4,6)+"/"+project_schedule.form.substring(6,8)
	
	
	row=new_table.insertRow(-1)
	column1 = row.insertCell(0)
	column2 = row.insertCell(1)
	
	column1.innerText="正式環境設定時間 ："
	column2.innerText=project_schedule.prod_set_start.substring(0,4)+"/"+project_schedule.prod_set_start.substring(4,6)+"/"+project_schedule.prod_set_start.substring(6,8)+"-"+project_schedule.prod_set_end.substring(0,4)+"/"+project_schedule.prod_set_end.substring(4,6)+"/"+project_schedule.prod_set_end.substring(6,8)
	
	
	row=new_table.insertRow(-1)
	column1 = row.insertCell(0)
	column2 = row.insertCell(1)
	
	column1.innerText="Pilot Run時間    ："
	column2.innerText=project_schedule.pilot_run_start.substring(0,4)+"/"+project_schedule.pilot_run_start.substring(4,6)+"/"+project_schedule.pilot_run_start.substring(6,8)+"-"+project_schedule.pilot_run_end.substring(0,4)+"/"+project_schedule.pilot_run_end.substring(4,6)+"/"+project_schedule.pilot_run_end.substring(6,8)
	
	
	row=new_table.insertRow(-1)
	column1 = row.insertCell(0)
	column2 = row.insertCell(1)
	
	column1.innerText="撥款確認時間     ："
	column2.innerText=project_schedule.allocate.substring(0,4)+"/"+project_schedule.allocate.substring(4,6)+"/"+project_schedule.allocate.substring(6,8)
	
	
	row=new_table.insertRow(-1)
	column1 = row.insertCell(0)
	column2 = row.insertCell(1)
	
	column1.innerText="提領確認時間     ："
	column2.innerText=project_schedule.withdraw.substring(0,4)+"/"+project_schedule.withdraw.substring(4,6)+"/"+project_schedule.withdraw.substring(6,8)
	
	
	row=new_table.insertRow(-1)
	column1 = row.insertCell(0)
	column2 = row.insertCell(1)
	
	column1.innerText="Pilot報告製作時間："
	column2.innerText=project_schedule.report_start.substring(0,4)+"/"+project_schedule.report_start.substring(4,6)+"/"+project_schedule.report_start.substring(6,8)+"-"+project_schedule.report_end.substring(0,4)+"/"+project_schedule.report_end.substring(4,6)+"/"+project_schedule.report_end.substring(6,8)
	
	
	row=new_table.insertRow(-1)
	column1 = row.insertCell(0)
	column2 = row.insertCell(1)
	
	column1.innerText="判定+業務上缐時間："
	column2.innerText=project_schedule.release_report.substring(0,4)+"/"+project_schedule.release_report.substring(4,6)+"/"+project_schedule.release_report.substring(6,8)
	
	
	schedule_show.innerHTML=""
	schedule_show.appendChild(new_table)
	// schedule_show.innerHTML= "UAT整測時間      ："+project_schedule.uat_start.substring(0,4)+"/"+project_schedule.uat_start.substring(4,6)+"/"+project_schedule.uat_start.substring(6,8)+"-"+project_schedule.uat_end.substring(0,4)+"/"+project_schedule.uat_end.substring(4,6)+"/"+project_schedule.uat_end.substring(6,8)+"<br/>"
	// schedule_show.innerHTML+="正式環境商戶過件 ："+project_schedule.form.substring(0,4)+"/"+project_schedule.form.substring(4,6)+"/"+project_schedule.form.substring(6,8)+"<br/>"
	// schedule_show.innerHTML+="正式環境設定時間 ："+project_schedule.prod_set_start.substring(0,4)+"/"+project_schedule.prod_set_start.substring(4,6)+"/"+project_schedule.prod_set_start.substring(6,8)+"-"+project_schedule.prod_set_end.substring(0,4)+"/"+project_schedule.prod_set_end.substring(4,6)+"/"+project_schedule.prod_set_end.substring(6,8)+"<br/>"
	// schedule_show.innerHTML+="Pilot Run時間    ："+project_schedule.pilot_run_start.substring(0,4)+"/"+project_schedule.pilot_run_start.substring(4,6)+"/"+project_schedule.pilot_run_start.substring(6,8)+"-"+project_schedule.pilot_run_end.substring(0,4)+"/"+project_schedule.pilot_run_end.substring(4,6)+"/"+project_schedule.pilot_run_end.substring(6,8)+"<br/>"
	// schedule_show.innerHTML+="撥款確認時間     ："+project_schedule.allocate.substring(0,4)+"/"+project_schedule.allocate.substring(4,6)+"/"+project_schedule.allocate.substring(6,8)+"<br/>"
	// schedule_show.innerHTML+="提領確認時間     ："+project_schedule.withdraw.substring(0,4)+"/"+project_schedule.withdraw.substring(4,6)+"/"+project_schedule.withdraw.substring(6,8)+"<br/>"
	// schedule_show.innerHTML+="Pilot報告製作時間："+project_schedule.report_start.substring(0,4)+"/"+project_schedule.report_start.substring(4,6)+"/"+project_schedule.report_start.substring(6,8)+"-"+project_schedule.report_end.substring(0,4)+"/"+project_schedule.report_end.substring(4,6)+"/"+project_schedule.report_end.substring(6,8)+"<br/>"
	// schedule_show.innerHTML+="判定+業務上缐時間："+project_schedule.release_report.substring(0,4)+"/"+project_schedule.release_report.substring(4,6)+"/"+project_schedule.release_report.substring(6,8)
}
