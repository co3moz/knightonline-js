```js
"FORMAT:" AA 55 LEN[0] LEN[1] {DATA} 55 AA

2B FF FF // request client exe version and encryption
01 04 00 74 65 73 74 07 00 47 57 56 55 56 49 30 00 00 00 01 00 01 00 00 00 // user/pass (string 04 00 74 65 73 74 account name, string 07 00 47 57 56 55 56 49 30 hashed password, we dont know the rest bytes)
9F 01 // load game (request queue to login)
0C 01  // character list request
04 04 00 74 65 73 74 04 00 74 65 73 74 01 15 // pick user / character name
6A 02 // check the items that waiting to give, if there is an item to give, give it
73 02 03 02 // rental request really don't know what it is, what it does, probably check item rental time thing
41 00 AA 51 04 42 00 // speed hack thing
72 06 29 FA CE 56 02 00 00 00 // hack tool request, we clearly don't know what it is
6B // server index request
0D 01 04 74 65 73 74 // game start with (01) and character name as byte string (04 74 65 73 74)
3C 41 // request top 10 knights
64 03 89 13 00 00 // quest thing
49 01 // friend list request | note response is (49 02 ...data)
87 00 00 // helmet visibility data (first 00 is helmet second 00 is cospre visibility) 0 means don't hide
3C 22 // request knight ally list
79 02 // request skill data
6A 05 01 // store process no need to handle
6A 06 01 // request unread letter count
0D 02 04 74 65 73 74 // game start with (02) now we did login (really :D, data will flow to us)
98 01 // user info request (this will send massive data)

09 00 00 // send chracter direction (00 00 short direction data)
09 05 00 // another sample of direction
06 EA 1F FE 10 2F 00 00 00 00 EA 1F FE 10 2F 00 // send chracter position (EA 1F) tx (FE 10) tz (2F 00) ty (00 00) speed (00) echo (EA 1F) nx (FE 10) nz (2F 00) ny (00 00) {t=target, n=now}
06 F0 1F 41 11 2F 00 2D 00 01 EA 1F FE 10 2F 00 // all of them are position send, more samples = better
06 E9 1F F6 10 2F 00 F1 FF 01 EB 1F 0C 11 2F 00
06 EA 1F 0A 11 2F 00 00 00 00 EA 1F 0A 11 2F 00

79 01 00 00 // skill data save request
97 01 03 00 00 23 00 00 00 1E 0A 1E 00 1E 00 50 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 0A 00 0A 00 00 00 00 00 00 00 // genie save options request
```