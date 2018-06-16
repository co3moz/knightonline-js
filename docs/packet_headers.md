```c
#ifndef PACKETDEFINE_H
#define PACKETDEFINE_H

//////////////////////////////////////////////////////////////////////////////////////
// USER Packet Define
//////////////////////////////////////////////////////////////////////////////////////
#define    LS_VERSION_REQ                             0x01
#define    LS_DOWNLOADINFO_REQ                         0x02
#define    LS_CRYPTION                                 0xF2
#define    LS_LOGIN_REQ                             0xF3
#define    LS_MGAME_LOGIN                             0xF4
#define    LS_SERVERLIST                             0xF5
#define    LS_NEWS                                     0xF6
#define    LS_CLOSESOCKET                             0xF7

#define WIZ_LOGIN                               0x01    // Account Login
#define WIZ_NEW_CHAR                            0x02    // Create Character DB
#define WIZ_DEL_CHAR                            0x03    // Delete Character DB
#define WIZ_SEL_CHAR                            0x04    // Select Character
#define WIZ_SEL_NATION                          0x05    // Select Nation
#define WIZ_MOVE                                0x06    // Move ( 1 Second )
#define WIZ_USER_INOUT                          0x07    // User Info Insert, delete
#define WIZ_ATTACK                              0x08    // General Attack
#define WIZ_ROTATE                              0x09    // Rotate
#define WIZ_NPC_INOUT                           0x0A    // Npc Info Insert, delete
#define WIZ_NPC_MOVE                            0x0B    // Npc Move ( 1 Second )
#define WIZ_ALLCHAR_INFO_REQ                    0x0C    // Account All Character Info Request
#define WIZ_GAMESTART                           0x0D    // Request Other User, Npc Info
#define WIZ_MYINFO                              0x0E    // User Detail Data Download
#define WIZ_LOGOUT                              0x0F    // Request Logout
#define WIZ_CHAT                                0x10    // User Chatting..
#define WIZ_DEAD                                0x11    // User Dead
#define WIZ_REGENE                              0x12    // User Regeneration
#define WIZ_TIME                                0x13    // Game Timer
#define WIZ_WEATHER                             0x14    // Game Weather
#define WIZ_REGIONCHANGE                        0x15    // Region UserInfo Receive
#define WIZ_REQ_USERIN                          0x16    // Client Request UnRegistered User List
#define WIZ_HP_CHANGE                           0x17    // Current HP Download
#define WIZ_MSP_CHANGE                          0x18    // Current MP Download
#define WIZ_ITEM_LOG                            0x19    // Send To Agent for Writing Log
#define WIZ_EXP_CHANGE                          0x1A    // Current EXP Download
#define WIZ_LEVEL_CHANGE                        0x1B    // Max HP, MP, SP, Weight, Exp Download
#define WIZ_NPC_REGION                          0x1C    // Npc Region Change Receive
#define WIZ_REQ_NPCIN                           0x1D    // Client Request UnRegistered NPC List
#define WIZ_WARP                                0x1E    // User Remote Warp
#define WIZ_ITEM_MOVE                           0x1F    // User Item Move
#define WIZ_NPC_EVENT                           0x20    // User Click Npc Event
#define WIZ_ITEM_TRADE                          0x21    // Item Trade
#define WIZ_TARGET_HP                           0x22    // Attack Result Target HP
#define WIZ_ITEM_DROP                           0x23    // Zone Item Insert
#define WIZ_BUNDLE_OPEN_REQ                     0x24    // Zone Item list Request
#define WIZ_TRADE_NPC                           0x25    // ITEM Trade start
#define WIZ_ITEM_GET                            0x26    // Zone Item Get
#define WIZ_ZONE_CHANGE                         0x27    // Zone Change
#define WIZ_POINT_CHANGE                        0x28    // Str, Sta, dex, intel, cha, point up down
#define WIZ_STATE_CHANGE                        0x29    // User Sitdown or Stand
#define WIZ_LOYALTY_CHANGE                      0x2A    // Nation Contribution
#define WIZ_VERSION_CHECK                       0x2B    // Client version check
#define WIZ_CRYPTION                            0x2C    // Cryption
#define WIZ_USERLOOK_CHANGE                     0x2D    // User Slot Item Resource Change
#define WIZ_NOTICE                              0x2E    // Update Notice Alarm
#define WIZ_PARTY                               0x2F    // Party Related Packet
#define WIZ_EXCHANGE                            0x30    // Exchange Related Packet
#define WIZ_MAGIC_PROCESS                       0x31    // Magic Related Packet
#define WIZ_SKILLPT_CHANGE                      0x32    // User changed particular skill point
#define WIZ_OBJECT_EVENT                        0x33    // Map Object Event Occur ( ex : Bind Point Setting )
#define WIZ_CLASS_CHANGE                        0x34    // 10 level over can change class
#define WIZ_CHAT_TARGET                         0x35    // Select Private Chanting User
#define WIZ_CONCURRENTUSER                      0x36    // Current Game User Count
#define WIZ_DATASAVE                            0x37    // User GameData DB Save Request
#define WIZ_DURATION                            0x38    // Item Durability Change
#define WIZ_TIMENOTIFY                          0x39    // Time Adaption Magic Time Notify Packet ( 2 Seconds )
#define WIZ_REPAIR_NPC                          0x3A    // Item Trade, Upgrade and Repair
#define WIZ_ITEM_REPAIR                         0x3B    // Item Repair Processing
#define WIZ_KNIGHTS_PROCESS                     0x3C    // Knights Related Packet..
#define WIZ_ITEM_COUNT_CHANGE                   0x3D    // Item cout change.
#define WIZ_KNIGHTS_LIST                        0x3E    // All Knights List Info download
#define WIZ_ITEM_REMOVE                         0x3F    // Item Remove from inventory
#define WIZ_OPERATOR                            0x40    // Operator Authority Packet
#define WIZ_SPEEDHACK_CHECK                     0x41    // Speed Hack Using Check
#define WIZ_COMPRESS_PACKET                     0x42    // Data Compressing Packet
#define WIZ_SERVER_CHECK                        0x43    // Server Status Check Packet
#define WIZ_CONTINOUS_PACKET                    0x44    // Region Data Packet
#define WIZ_WAREHOUSE                           0x45    // Warehouse Open, In, Out
#define WIZ_SERVER_CHANGE                       0x46    // When you change the server
#define WIZ_REPORT_BUG                          0x47    // Report Bug to the manager
#define WIZ_HOME                                0x48    // 'Come back home' by Seo Taeji & Boys
#define WIZ_FRIEND_REPORT                       0x49    // Get the status of your friend
#define WIZ_GOLD_CHANGE                         0x4A    // When you get the gold of your enemy.
#define WIZ_WARP_LIST                           0x4B    // Warp List by NPC or Object
#define WIZ_VIRTUAL_SERVER                      0x4C    // Battle zone Server Info packet       (IP, Port)
#define WIZ_ZONE_CONCURRENT                     0x4D    // Battle zone concurrent users request packet
#define WIZ_CORPSE                              0x4e    // To have your corpse have an ID on top of it.
#define WIZ_PARTY_BBS                           0x4f    // For the party wanted bulletin board service..
#define WIZ_MARKET_BBS                          0x50    // For the market bulletin board service...
#define WIZ_KICKOUT                             0x51    // Account ID forbid duplicate connection
#define WIZ_CLIENT_EVENT                        0x52    // Client Event (for quest)
#define I_DONT_KNOW                             0x53    //
#define WIZ_WEIGHT_CHANGE                       0x54    // Notify change of weight
#define WIZ_SELECT_MSG                          0x55    // Select Event Message...
#define WIZ_NPC_SAY                             0x56    // Select Event Message...
#define WIZ_BATTLE_EVENT                        0x57    // Battle Event Result
#define WIZ_AUTHORITY_CHANGE                    0x58    // Authority change
#define WIZ_EDIT_BOX                            0x59    // Activate/Receive info from Input_Box.
#define WIZ_SANTA                               0x5A    // Activate motherfucking Santa Claus!!! :(
#define WIZ_TEST_PACKET                         0xFF    // Test packet

//////////////////////////////////////////////////////////////////////////////////////
// NEW USER Packet Define
//////////////////////////////////////////////////////////////////////////////////////

#define WIZ_ITEM_UPGRADE                        0x5B    // Magic Anvil & Item Seal & Chaotic generator & Character seal
#define WIZ_ZONEABILITY                         0x5E    // Zone ability
#define WIZ_TEMPLE                              0x5F    // BDW & Chaos
#define WIZ_PACKETPROCESS                       0x61    // Packet process room manager
#define WIZ_ROOMEVENT                           0x62    // room event manager
#define WIZ_QUEST                               0x64    // Quest related message
#define WIZ_RECOMMEND_USER                      0x67    // Recommend user
#define WIZ_MERCHANT                            0x68    // Merchanting
#define WIZ_MERCHANT_INOUT                      0x69    // Show merchant items
#define WIZ_LETTER                              0x6A    // Letter system / Power-up store
#define WIZ_SERVERINDEX                         0x6B    // Server index
#define WIZ_EFFECT                              0x6C    // Effects
#define WIZ_SIEGESYSTEM                         0x6D    // Siege
#define WIZ_CHANGENAME                          0x6E    // Change name
#define WIZ_WEBPAGE                             0x6F    // Web page
#define WIZ_CHANGE_CAPE                         0x70    // Purchase cape
#define WIZ_PREMIUM                             0x71    // Premium system
#define WIZ_HACKTOOL                            0x72    // Third party tool
#define WIZ_RENTAL                              0x73    // Rental system
#define WIZ_COMBAT                              0x75    // Challenge related packet
#define WIZ_PETSYSTEM                           0x76    // Pet system
#define WIZ_CHINA                               0x77    // China
#define WIZ_KING                                0x78    // King related packet
#define WIZ_SKILLDATA                           0x79    // Skill data
#define WIZ_PROGRAMCHECK                        0x7A    // Program check
#define WIZ_BEEFTIMER                           0x7B    // Bifrost timer
#define WIZ_REPORT                              0x7C    // Report user
#define WIZ_LOGOSSHOUT                          0x7D    // Logos shout
#define WIZ_KILLSWITCH                          0x7F    //
#define WIZ_RANKINFO                            0x80    // CZ Rank list
#define WIZ_STORY                               0x81    // Baslangicta gelen oyun hikayesi
#define WIZ_MINE                                0x86    // Mining & Soccer
#define WIZ_HELMET                              0x87    // Visible & Invisible helmet
#define WIZ_CHANGESTYLE                         0x89    // Hair & color change
#define WIZ_USERLIST                            0x9F    // Etraftakiler
#define WIZ_XIGNCODE                            0xA0

////////////////////////////////////////////////////////////////
// PUS Packet sub define
////////////////////////////////////////////////////////////////
#define        STORE_OPEN                            0x01
#define        STORE_CLOSE                            0x02
#define        STORE_BUY                            0x03
#define        STORE_MINI                            0x04
#define        STORE_PROCESS                        0x05
#define        STORE_LETTER                        0x06

////////////////////////////////////////////////////////////////
// Letter Packet sub define
////////////////////////////////////////////////////////////////
#define    LETTER_UNREAD                            0x01
#define    LETTER_LIST                                0x02
#define    LETTER_HISTORY                            0x03
#define    LETTER_GET_ITEM                            0x04
#define    LETTER_READ                                0x05
#define    LETTER_SEND                                0x06
#define    LETTER_DELETE                            0x07
#define    LETTER_ITEM_CHECK                        0x08

////////////////////////////////////////////////////////////////
// Merchant Packet sub define
////////////////////////////////////////////////////////////////
#define MERCHANT_OPEN                           0x01
#define MERCHANT_CLOSE                          0x02
#define MERCHANT_ITEM_ADD                       0x03
#define MERCHANT_ITEM_CANCEL                    0x04
#define MERCHANT_ITEM_LIST                      0x05
#define MERCHANT_ITEM_BUY                       0x06
#define MERCHANT_INSERT                         0x07
#define MERCHANT_CANCEL                         0x08

#define BUY_MERCHANT_OPEN                       0x21
#define BUY_MERCHANT_INSERT                     0x22
#define BUY_MERCHANT_CANCEL                     0x27

////////////////////////////////////////////////////////////////
// Mailbox define
////////////////////////////////////////////////////////////////
#define MBX_CHECKMAIL                           0x01
#define MBX_REQMAIL                             0x02
#define MBX_HISTORY                             0x03
#define MBX_GETITEM                             0x04
#define MBX_READLETTER                          0x05
#define MBX_SENDLETTER                          0x06
#define MBX_DELLETTER                           0x07
#define MBX_CHECKITEM                           0x08

////////////////////////////////////////////////////////////////
// Skill data define
////////////////////////////////////////////////////////////////
#define SKILLDATA_SAVE                          0x01
#define SKILLDATA_LOAD                          0x02
#define SKILLDATA_SEND                          0x04

////////////////////////////////////////////////////////////////
// chat define
////////////////////////////////////////////////////////////////
#define GENERAL_CHAT                            0x01
#define PRIVATE_CHAT                            0x02
#define PARTY_CHAT                              0x03
#define FORCE_CHAT                              0x04
#define SHOUT_CHAT                              0x05
#define KNIGHTS_CHAT                            0x06
#define PUBLIC_CHAT                             0x07
#define WAR_SYSTEM_CHAT                         0x08
#define PERMANENT_CHAT                          0x09
#define END_PERMANENT_CHAT                      0x0A
#define REPEAT_CHAT                             0x0B // Quest failed hatasi veriyor
#define END_REPEAT_CHAT                         0x0C // Mor yazi yaziyor
#define COMMAND_CHAT                            0x0D
#define MERCHANT_CHAT                           0x0E
#define ALLIANCE_CHAT                           0x0F
#define TOP_PUBLIC_CHAT                         0x11
#define CLAN_NOTICE                             0x18

////////////////////////////////////////////////////////////////
// weather define
////////////////////////////////////////////////////////////////
#define WEATHER_FINE                            0x01
#define WEATHER_RAIN                            0x02
#define WEATHER_SNOW                            0x03
#define WEATHER_LEAF                            0x04 

////////////////////////////////////////////////////////////////
// Party Related subpacket define
////////////////////////////////////////////////////////////////
#define PARTY_CREATE                            0x01    // Party Group Create
#define PARTY_PERMIT                            0x02    // Party Insert Permit
#define PARTY_INSERT                            0x03    // Party Member Insert
#define PARTY_REMOVE                            0x04    // Party Member Remove
#define PARTY_DELETE                            0x05    // Party Group Delete
#define PARTY_HPCHANGE                          0x06    // Party Member HP change
#define PARTY_LEVELCHANGE                       0x07    // Party Member Level change
#define PARTY_CLASSCHANGE                       0x08    // Party Member Class Change
#define PARTY_STATUSCHANGE                      0x09    // Party Member Status ( disaster, poison ) Change
#define PARTY_REGISTER                          0x0A    // Party Message Board Register
#define PARTY_REPORT                            0x0B    // Party Request Message Board Messages

////////////////////////////////////////////////////////////////
// Exchange Related subpacket define
////////////////////////////////////////////////////////////////
#define EXCHANGE_REQ                            0x01
#define EXCHANGE_AGREE                          0x02
#define EXCHANGE_ADD                            0x03
#define EXCHANGE_OTHERADD                       0x04
#define EXCHANGE_DECIDE                         0x05
#define EXCHANGE_OTHERDECIDE                    0x06
#define EXCHANGE_DONE                           0x07
#define EXCHANGE_CANCEL                         0x08

////////////////////////////////////////////////////////////////
// Magic Packet sub define
////////////////////////////////////////////////////////////////
#define MAGIC_CASTING                           0x01
#define MAGIC_FLYING                            0x02
#define MAGIC_EFFECTING                         0x03
#define MAGIC_FAIL                              0x04
#define MAGIC_TYPE3_END                         0x05    // For type 3 durational spells.
#define MAGIC_TYPE4_END                         0x05    // For type 4 durational spells.
#define MAGIC_CANCEL                            0x06    // When you wanna cancel your own Type 4.

////////////////////////////////////////////////////////////////
// Knights Packet sub define
////////////////////////////////////////////////////////////////
#define KNIGHTS_CREATE                          0x01            // 생성
#define KNIGHTS_JOIN                            0x02            // 가입
#define KNIGHTS_WITHDRAW                        0x03            // 탈퇴
#define KNIGHTS_REMOVE                          0x04            // 멤버 삭제
#define KNIGHTS_DESTROY                         0x05            // 뽀개기
#define KNIGHTS_ADMIT                           0x06            // 멤버 가입 허가
#define KNIGHTS_REJECT                          0x07            // 멤버 가입 거절
#define KNIGHTS_PUNISH                          0x08            // 멤버 징계
#define KNIGHTS_CHIEF                           0x09            // 단장 임명
#define KNIGHTS_VICECHIEF                       0x0A            // 부단장 임명
#define KNIGHTS_OFFICER                         0x0B            // 장교임명
#define KNIGHTS_ALLLIST_REQ                     0x0C            // 리스트를 10개 단위로 Page 요청
#define KNIGHTS_MEMBER_REQ                      0x0D            // 모든 멤버 요청
#define KNIGHTS_CURRENT_REQ                     0x0E            // 현재 접속 리스트
#define KNIGHTS_STASH                           0x0F            // 기사단 창고
#define KNIGHTS_MODIFY_FAME                     0x10            // 멤버의 직위 변경.. 해당 멤버에게 간다
#define KNIGHTS_JOIN_REQ                        0x11            // 해당멤버에게 가입요청을 한다
#define KNIGHTS_LIST_REQ                        0x12            // 기사단 리스트를  요청 ( index 검색 )
#define KNIGHTS_SYMBOL_REG                      0x19            // Symbol change
#define KNIGHTS_SYMBOL_RECV                     0x1A            //
#define KNIGHTS_SYMBOL_GET                      0x23            // Clan symbol
#define KNIGHTS_CAPE_NPC                        0x1B            // Cape NPC
#define KNIGHTS_ALLIANCE_JOIN_REQ               0x1E            // Alliance join
#define KNIGHTS_ALLIANCE_LIST_REQ               0x22            // Alliance list
#define KNIGHTS_CLAN_POINTS_REQ                 0x3B            // Clan Points
#define KNIGHTS_HANDOVER                        0x3E            // Clan handover
#define KNIGHTS_SAVED_CONT_REQ                  0x40            // Saved Cont list
#define KNIGHTS_TOP10_SYMBOLS                   0x41            // Moradon & Luferson & Elmorad top10(5 human 5 karus) clan symbols


////////////////////////////////////////////////////////////////
// Operator Autority Packet define
////////////////////////////////////////////////////////////////
#define OPERATOR_ARREST                         0x01
#define OPERATOR_KILL                           0x02
#define OPERATOR_NOTCHAT                        0x03
#define OPERATOR_CHAT                           0x04
#define OPERATOR_CUTOFF                         0x05
#define OPERATOR_NOATTACK                       0x08
#define OPERATOR_ATTACK                         0x09

////////////////////////////////////////////////////////////////
// WareHouse Packet sub define
////////////////////////////////////////////////////////////////
#define WAREHOUSE_OPEN                          0x01
#define WAREHOUSE_INPUT                         0x02
#define WAREHOUSE_OUTPUT                        0x03
#define WAREHOUSE_MOVE                          0x04
#define WAREHOUSE_INVENMOVE                     0x05
#define WAREHOUSE_REQ                           0x10

////////////////////////////////////////////////////////////////
// Clan Packet sub define
////////////////////////////////////////////////////////////////
#define CLAN_CREATE                             0x01
#define CLAN_JOIN                               0x02

////////////////////////////////////////////////////////////////
// Class change define
////////////////////////////////////////////////////////////////
#define CLASS_CHANGE_REQ                        0x01
#define CLASS_CHANGE_RESULT                     0x02
#define ALL_POINT_CHANGE                        0x03
#define ALL_SKILLPT_CHANGE                      0x04
#define CHANGE_MONEY_REQ                        0x05

////////////////////////////////////////////////////////////////
// Friend subpacket define
////////////////////////////////////////////////////////////////
#define FRIEND_REQUEST                          0x01
#define FRIEND_ACCEPT                           0x02
#define FRIEND_REPORT                           0x03
#define FRIEND_CANCEL                           0x04

////////////////////////////////////////////////////////////////
// Party BBS subpacket define
////////////////////////////////////////////////////////////////
#define PARTY_BBS_REGISTER                      0x01
#define PARTY_BBS_DELETE                        0x02
#define PARTY_BBS_NEEDED                        0x03
#define PARTY_BBS_WANTED                        0x04

////////////////////////////////////////////////////////////////
// Market BBS primary subpacket define
////////////////////////////////////////////////////////////////
#define MARKET_BBS_REGISTER                     0x01
#define MARKET_BBS_DELETE                       0x02
#define MARKET_BBS_REPORT                       0x03
#define MARKET_BBS_OPEN                         0x04
#define MARKET_BBS_REMOTE_PURCHASE              0x05
#define MARKET_BBS_MESSAGE                      0x06

////////////////////////////////////////////////////////////////
// Market BBS secondary subpacket define
////////////////////////////////////////////////////////////////
#define MARKET_BBS_BUY                          0x01
#define MARKET_BBS_SELL                         0x02

////////////////////////////////////////////////////////////////
#define WIZ_LOGIN_INFO                          0x50    // define for DBAgent Communication
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
// Server to Server Communication
////////////////////////////////////////////////////////////////
#define STS_CHAT                                0xD0
#define UDP_BATTLE_EVENT_PACKET                 0xD1
#define UDP_KNIGHTS_PROCESS                     0xD2
#define UDP_BATTLEZONE_CURRENT_USERS            0xD3
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
// Server to DB Agnent Communication
////////////////////////////////////////////////////////////////
#define DB_COUPON_EVENT                         0x10    // coupon event
#define CHECK_COUPON_EVENT                      0x01
#define UPDATE_COUPON_EVENT                     0x02
////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////
// Authority change subpacket define
////////////////////////////////////////////////////////////////
#define COMMAND_AUTHORITY                       0x01

#endif
```