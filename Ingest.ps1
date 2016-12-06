$a = Import-Csv ..\RU-CS\DB-336\Project-Proposal\d.csv
$headers = "id","sector","name","state","calendar_type","2011_12_price","2013_14_price","price_pct_change"
$Raw = "id","Sector","Name of institution","State","Calendar system","2011-12 Net price","2013-14 Net price","Percent change"
$b = ($a | % {$v = $_;($Raw | % {?:($_ -in $Raw[2..4]){'"'+$v.$_+'"'}{$v.$_}}) -join ","} | % {"($_)"})
To-Clipboard ($b -join ",")
To-Clipboard ((Get-Clipboard).ToCharArray() | ? {[int][char]$_ -le 256}) -join "")
