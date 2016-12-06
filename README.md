# College Data Examiner
> Exploratory Dashboard to view College Data and it's relationships with Crime Data

## Features
> Lot's of added functionality and features:
- Modern Design [MEAN stack but with MySql]
- All interactions over restful API's or Websockets
- Modern responsive material design
- Promisified DB custom adapter for ASYNC awesomeness with queries
- Leveraging **Heroku** and **Google Cloud Engine**

## Disclaimer
> For best results please use the latest version of Google Chrome

## Tables
>
name | rows
---  | ---
_**colleges**_ | `id*`,`sector**`,`name`,`state**`,`calendar_type`,`2011_12_price`,`2013_14_price`,`price_pct_change`
_**sectors**_ | `id*`,`name`
_**state_crime**_ | `abr*`,`name`,`population`,`violent_crime_rate`,`murder_rate`,`rape_rate`,`robbery_rate`,`aggravated_assault_rate`,`property_crime_rate`,`burglary_rate`,`theft_rate`,`motor_theft_rate`,`colleges`,`avg_tuition`
>
#### Note:
- `*` means PK
- `**` means FK

## Queries:
> - `SELECT name,2013_14_price as tuition FROM colleges order by tuition DESC limit 1`
- `SELECT name,2013_14_price as tuition FROM colleges order by tuition limit 1`
- `SELECT name as state,property_crime_rate+violent_crime_rate as crime from state_crime order by crime DESC limit 1`
- `SELECT name as state,property_crime_rate+violent_crime_rate as crime from state_crime order by crime limit 1`
- `select state, tuition, violent_crime_rate as vcrime, property_crime_rate as pcrime from state_crime s, (select state,avg(2013_14_price) as tuition from colleges group by state) t where s.abr=t.state`
- `select name as state,population as pop,violent_crime_rate+property_crime_rate as crime from state_crime`
- `select s.name as sector,round(avg(2013_14_price),2) as tuition from sectors s, colleges c where c.sector=s.id group by sector`
- `SELECT calendar_type,count(*) as count FROM colleges group by calendar_type`
- `SELECT s.*,count(*) as colleges,avg(c.2013_14_price) as avg_tuition FROM state_crime s,colleges c where c.state=s.abr and c.state=? group by s.abr`
- `select state,count(*) as c from colleges group by state`
- `select max(2013_14_price) as max,min(2013_14_price) as min from colleges`
- `select name from sectors`
- `select distinct state from colleges`
- `select c.name as college,s.name as sector,state,2011_12_price,2013_14_price,price_pct_change from colleges c,sectors s where c.sector=s.id and 2013_14_price >= ? and 2013_14_price <= ?`

