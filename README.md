# vefforritun-lokaverkefni
Lokaverkefni í Vefforritun 2015 í HÍ

## Verkefnið
Þetta verkefni er unnið út frá Verkefni 3, þar sem hannað var lítið dagbókar/minnismiða-færslukerfi. Þetta verkefni fer aðeins lengra með það og bætir við innskráningarkerfi, tékklistum og deilikerfi milli notenda. Verkefnið er unnið í Node JS, með Express og Postgres á bakendanum, og JQuery/Jade (HTML) á framendanum.

## Planið
Það voru nokkrir hlutir sem ég vildi að kerfið myndi geta gert og stefndi ég á að klára að útfæra þá einn af öðrum, í þeirri röð sem eðlilegast væri að gera þá. Ég vildi allavega

- Að notendur gætu skráð sig inn 
- Að notendur gætu búið til, breytt, skoðað og eytt sínum færslum (bæði notes og tékklistum)

Og aukalega sá ég fyrir mér að gaman væri ef notendur gætu deilt færslum með öðrum notendum, en það gerði ég ekki að kröfu.

## Útfærsla
Ég tók HTML og Javascript kóðann úr Verkefni 3 og byrjaði að tengja formið við bakendann og gagnagrunninn án nokkurs Javascript kóða. Þannig er kerfið nothæft ef svo kynni að Javascript stuðningur væri ekki til staðar. Næst byrjaði ég að búa til AJAX köll með JQuery til að bæta við færslum og eiga við DOM-ið. Ég endaði fljótt á að endurskrifa allan Javascript kóða sem ég þurfti með JQuery og því er ekkert endurnýtt þar. 

Ég notaðist mikið við Bootstrap í verkefninu þar sem það er svo þægilegt, sérstaklega með hluti eins og form og takka og slíkt. Ég þurfti samt að sjálfsögðu að skrifa eitthvað CSS og notaði ég SASS í það.

Næst á dagskrá var tékklistinn. Ég byrjaði að reyna að láta hann virka án Javascript en gafst fljótlega upp á því og útfærði hann í Javascript/Jquery. Hann virkar að mínu mati mjög vel og er ég ánægður með útkomuna.

Á bakendanum er í raun aðeins einn router sem sér um mestöll köllin. Það er sá sem svarar til /entries á síðunni. Route-in voru skrifuð eitt af öðru en þegar fór að líða á verkefnið áttaði ég mig á því hvað ég var að endurtaka mikinn kóða og fattaði þá að færa útfærsluna meira inn í middleware, sem er mjög þægilegt og einfaldar kóðann mjög.

Þegra öll grunn virkni var komin í kerfið fór ég að huga að deilikerfinu. Ég bætti við töflu í gagnagrunninn sem heldur utan um ID á færslu og samsvarandi ID notanda sem hefur aðgang að henni. Þannig er einfalt að finna bæði notendur sem hafa aðgang að færslunni og finna allar færslur sem notandi hefur aðgang að. Svo bætti ég við formi á síðuna þar sem hægt er að leita eftir notendanafni og deila með notanda. Þá er bæði hefðbundin leit með submit takka og search-as-you-type leit í Javascript. Eins og er þá geta notendur bara skoðað færslur sem hefur verið deilt með þeim, en upprunalega sá ég fyrir mér að þeir gætu einnig breytt færslunni. En það vannst ekki tími til að útfæra það.

### Heroku deploy
Heroku hlutinn gekk vandræðalaust fyrir sig, en ég prufaði samt tímanlega að deploy-a þangað til að vera með vaðið fyrir neðan mig. Ég deploya beint af github sem er mjög þægilegt.

# Útkoman
Þegar allt er komið til alls er komin nokkuð góð virkni í kerfið. JQuery gerir lífið skemmtilegra og reyndi ég að hafa hlutina dýnamíska þar sem það átti við. Eins og áður kom fram þá finnst mér tékklistinn nokkuð vel heppnaður. Þó hér sé ekki verið að finna upp hjólið þá var þetta nú samt ágætlega skemmtilegt. Einnig áttaði ég mig enn betur á því hvað JQuery er þægilegt og mikil snilld.

Ég rann all harkalega á rassinn varðandi tíma með þetta verkefni og hefði alveg mátt byrja fyrr. En mér tókst nú að gera allt sem ég stefndi á að gera og maður getur endalaust látið sér detta í hug nýja fítusa. Annað sem ekki var tími til að útfæra er pagination þegar gögn eru sótt og birt, sem þarf svo sannarlega að vera í lagi þegar gagnagrunnurinn vex. Ég hafði einnig ekki mikinn tíma til að spá í útliti og mobile-responsiveness. En Bootstrap tæklar það ágætlega.

