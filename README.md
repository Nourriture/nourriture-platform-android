nourriture-android-platform
===========================

Repository for the Nourriture Android application's backend.

The Nourriture Android application's backend is the backend for the Android app. It provides REST API to developers.

Please, refer to the architecture diagram (http://tinyurl.com/qattlat).

********************************************

#### The detailed list of our API
	   
	┌────────┬───────────────────────────────┬─────────────────────────────────┐
	│        │ Name                          │ Path                            │
	├────────┼───────────────────────────────┼─────────────────────────────────┤
	│ POST   │ postconsumer                  │ /consumer                       │
	├────────┼───────────────────────────────┼─────────────────────────────────┤
	│ GET    │ getconsumerusername           │ /consumer/:username             │
	├────────┼───────────────────────────────┼─────────────────────────────────┤
	│ PUT    │ putconsumerusername           │ /consumer/:username             │
	├────────┼───────────────────────────────┼─────────────────────────────────┤
	│ DELETE │ deleteconsumerusername        │ /consumer/:username             │
	├────────┼───────────────────────────────┼─────────────────────────────────┤
	│ GET    │ getconsumer                   │ /consumer/                      │
	├────────┼───────────────────────────────┼─────────────────────────────────┤
	│ GET    │ getconsumerusernamefollowing  │ /consumer/:username/following   │
	├────────┼───────────────────────────────┼─────────────────────────────────┤
	│ POST   │ postconsumerusernamefollowing │ /consumer/:username/following   │
	├────────┼───────────────────────────────┼─────────────────────────────────┤
	│ POST   │ postmoment                    │ /moment/                        │
	├────────┼───────────────────────────────┼─────────────────────────────────┤
	│ GET    │ getmomentrecipeid             │ /moment/:recipeId               │
	└────────┴───────────────────────────────┴─────────────────────────────────┘
********************************************
