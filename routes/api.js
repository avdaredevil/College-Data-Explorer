var express  = require("express");
var path  = require("path");
var request  = require("request");
var router   = express.Router();
var mysql = require('mysql')
const myCon = _ => mysql.createConnection({
    host:      '104.196.197.10',
    database:  'college_data',
    user     : 'root',
    password : '123456'
});

const runQuery = (q,vals) => new Promise((res,rej) => {
    const con = myCon(), args = [q]
    if (vals && vals.length) {args.push(vals)}
    con.query(...args, (err,rows) => {
        if (err) {return rej(err)}
        con.end()
        return res(rows)
    })
})
const MakeJSON = j => typeof j=="object"?j:JSON.parse(j)
//=======================================================================|
function APIErr(res, message, code) {
    const m = typeof message == "object" ? message : {message : message};
    return res.status(code||403).json(m);
}

function APISucc(res, message) {
    return res.status(200).json(message);
}
//= CRIMES ===============================================|
router.get("/stats/All-Stats", function(req, res) {
    const o = {}
    Promise.all([
        "SELECT name,2013_14_price as tuition FROM colleges order by tuition DESC limit 1",
        "SELECT name,2013_14_price as tuition FROM colleges order by tuition limit 1",
        "SELECT name as state,property_crime_rate+violent_crime_rate as crime from state_crime order by crime DESC limit 1",
        "SELECT name as state,property_crime_rate+violent_crime_rate as crime from state_crime order by crime limit 1",
    ].map(i => runQuery(i)))
        .then(data => {
            data = data.map(i => i[0])
            o.maxT = data[0].name+" with $"+data[0].tuition
            o.minT = data[1].name+" with $"+data[1].tuition
            o.maxC = data[2].state+" with "+data[2].crime+" crimes"
            o.minC = data[3].state+" with "+data[3].crime+" crimes"
            res.json(o)
        })
        .catch(err => APIErr(res,err))
})
router.get("/stats/:type", function(req, res) {
    let query, lambda = rows => res.json({rows: rows});
    switch(req.params.type) {
        case "Tuition-vs-Crime":
            query = 'select state, tuition, violent_crime_rate as vcrime, property_crime_rate as pcrime from state_crime s, (select state,avg(2013_14_price) as tuition from colleges group by state) t where s.abr=t.state'
            break
        case "Pop-Crime":
            query = 'select name as state,population as pop,violent_crime_rate+property_crime_rate as crime from state_crime'
            break
        case "Sector-Tuition":
            query = "select s.name as sector,round(avg(2013_14_price),2) as tuition from sectors s, colleges c where c.sector=s.id group by sector"
            break
        case "Calendar-Types":
            query = "SELECT calendar_type,count(*) as count FROM colleges group by calendar_type"
            break
        default: return APIErr(res, "Invalid Type of Statistic requested")
    }
    runQuery(query).then(lambda).catch(err => APIErr(res,err))
})
//= STATES ===============================================|
router.get("/getStateInformation/:state", function(req, res) {
    runQuery('SELECT s.*,count(*) as colleges,avg(c.2013_14_price) as avg_tuition FROM state_crime s,colleges c where c.state=s.abr and c.state=? group by s.abr',[req.params.state])
        .then(rows => res.json(rows[0]||{noData: true}))
        .catch(err => APIErr(res,err))
})
router.get("/getStateDensity", function(req, res) {
    runQuery('select state,count(*) as c from colleges group by state')
        .then(rows => res.json({rows: rows.map(i => ({value: i.c, code: i.state, drilldown: i.state}))}))
        .catch(err => APIErr(res,err))
})
//= INDEX ================================================|
router.get("/getTuitionStats", function(req, res) {
    runQuery('select max(2013_14_price) as max,min(2013_14_price) as min from colleges')
        .then(rows => res.json(rows[0]))
        .catch(err => APIErr(res,err))
})
router.get("/getSectors", function(req, res) {
    runQuery('select name from sectors')
        .then(rows => res.json({rows: rows.map(r => r.name)}))
        .catch(err => APIErr(res,err))
})
router.get("/getStates", function(req, res) {
    runQuery('select distinct state from colleges')
        .then(rows => res.json({rows: rows.map(r => r.state)}))
        .catch(err => APIErr(res,err))
})
router.get("/getData", function(req, res) {
    const q = req.query, wh = {w:[],v:[]}, tr = {state: "state", sector: "s.name"};
    ["state","sector"].forEach(k => {
        q[k] && (wh.w.push(tr[k]),wh.v.push(q[k]))
    })
    let query = 'select c.name as college,s.name as sector,state,2011_12_price,2013_14_price,price_pct_change from colleges c,sectors s where c.sector=s.id and 2013_14_price >= ? and 2013_14_price <= ?'
    wh.w.forEach(w => {query+=" and "+w+"=?"})
    runQuery(query,[Number(q.minTuition||0),Number(q.maxTuition||Number.MAX_SAFE_INTEGER)].concat(wh.v))
        .then(rows => res.json({rows: rows, query: query}))
})
router.get("/Remove-Video/:vid", function(req, res) {
    //TODO: Implement this route
    res.json({na:"na","naa":"naa",bat:"man"})
})
router.use(function(req, res, next) {APIErr(res, "Invalid API call", 403)});
module.exports = router;
