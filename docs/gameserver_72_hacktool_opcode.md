```cpp
void CUser::HackTool(Packet & pkt)
{
	// Geçici -> Veritabanına bağlanması gerekiyor.
	// -> CENGLYY.
	Packet result(WIZ_HACKTOOL, uint8(0x01));
	result << uint16(16) // kaç adet sayı
		<< result << (std::string)"cheatengine-x86_64.exe"
		<< result << (std::string)"Cheat Engine.exe"
		<< result << (std::string)"Cheat Engine"
		<< result << (std::string)"Window Hide Tool.exe"
		<< result << (std::string)"CapsLock.exe"
		<< result << (std::string)"winrar4.exe"
		<< result << (std::string)"winrar33.exe"
		<< result << (std::string)"Mozilla.exe"
		<< result << (std::string)"pedalv9.0.exe"
		<< result << (std::string)"Smart Utility Makro.exe"
		<< result << (std::string)"kuduzinek.exe"
		<< result << (std::string)"synapse.exe"
		<< result << (std::string)"PCHunter64.exe"
		<< result << (std::string)"PCHunter32.exe"
		<< result << (std::string)"Kuduzsinek.exe"
		<< result << (std::string)"CapsLock_1_.exe";
	Send(&result);
}
```