-- languages
INSERT INTO public.languages (code,name,native_name,flag,is_active,is_default,sort_order) VALUES
('tr','Turkish','Türkçe','🇹🇷',true,true,1),
('en','English','English','🇬🇧',true,false,2);

-- translations
INSERT INTO public.translations (locale,namespace,key,value) VALUES
('tr','common','nav.features','Özellikler'),('en','common','nav.features','Features'),
('tr','common','nav.how','Nasıl Çalışır'),('en','common','nav.how','How it works'),
('tr','common','nav.plans','Planlar'),('en','common','nav.plans','Pricing'),
('tr','common','nav.faq','SSS'),('en','common','nav.faq','FAQ'),
('tr','common','nav.contact','İletişim'),('en','common','nav.contact','Contact'),
('tr','common','auth.login','Giriş Yap'),('en','common','auth.login','Sign in'),
('tr','common','auth.register','Kaydol'),('en','common','auth.register','Sign up'),
('tr','common','auth.logout','Çıkış Yap'),('en','common','auth.logout','Sign out'),
('tr','common','auth.email','E-posta'),('en','common','auth.email','Email'),
('tr','common','auth.password','Parola'),('en','common','auth.password','Password'),
('tr','common','auth.fullName','Ad Soyad'),('en','common','auth.fullName','Full name'),
('tr','common','auth.google','Google ile devam et'),('en','common','auth.google','Continue with Google'),
('tr','common','action.getStarted','Hemen Başla'),('en','common','action.getStarted','Get started'),
('tr','common','action.viewDemo','Demo Markayı Gör'),('en','common','action.viewDemo','View demo brand'),
('tr','common','action.readMore','Oku'),('en','common','action.readMore','Read'),
('tr','common','action.details','Detaylar'),('en','common','action.details','Details'),
('tr','common','action.close','Kapat'),('en','common','action.close','Close'),
('tr','common','action.send','Gönder'),('en','common','action.send','Send'),
('tr','common','action.addToCart','Sepete Ekle'),('en','common','action.addToCart','Add to cart'),
('tr','common','cart.title','Sepetiniz'),('en','common','cart.title','Your cart'),
('tr','common','cart.empty','Sepetiniz boş'),('en','common','cart.empty','Your cart is empty'),
('tr','common','cart.total','Toplam'),('en','common','cart.total','Total'),
('tr','common','cart.checkout','Siparişi Tamamla'),('en','common','cart.checkout','Place order'),
('tr','common','menu.search','Menüde ara'),('en','common','menu.search','Search the menu'),
('tr','common','menu.all','Tümü'),('en','common','menu.all','All'),
('tr','common','menu.specials','Spesiyaller'),('en','common','menu.specials','Specials'),
('tr','common','site.about','Hakkımızda'),('en','common','site.about','About us'),
('tr','common','site.branches','Şubeler'),('en','common','site.branches','Branches'),
('tr','common','site.campaigns','Kampanyalar'),('en','common','site.campaigns','Campaigns'),
('tr','common','site.posts','Haberler'),('en','common','site.posts','News'),
('tr','common','site.menu','Menü'),('en','common','site.menu','Menu'),
('tr','common','site.contact','İletişim'),('en','common','site.contact','Contact'),
('tr','common','site.hours','Çalışma Saatleri'),('en','common','site.hours','Opening hours'),
('tr','common','site.directions','Yol Tarifi'),('en','common','site.directions','Directions'),
('tr','common','campaign.ongoing','Devam eden'),('en','common','campaign.ongoing','Ongoing'),
('tr','common','campaign.ended','Sona eren'),('en','common','campaign.ended','Ended'),
('tr','common','form.name','Adınız'),('en','common','form.name','Your name'),
('tr','common','form.phone','Telefon'),('en','common','form.phone','Phone'),
('tr','common','form.message','Mesajınız'),('en','common','form.message','Your message'),
('tr','common','form.success','Mesajınız alındı, teşekkürler.'),('en','common','form.success','Thanks, we received your message.'),
('tr','common','form.error','Bir hata oluştu, lütfen tekrar deneyin.'),('en','common','form.error','Something went wrong, please try again.'),
('tr','common','admin.dashboard','Kontrol Paneli'),('en','common','admin.dashboard','Dashboard'),
('tr','common','admin.tenants','Tenantlar'),('en','common','admin.tenants','Tenants'),
('tr','common','admin.agents','Acenteler'),('en','common','admin.agents','Agents'),
('tr','common','admin.plans','Planlar'),('en','common','admin.plans','Plans'),
('tr','common','admin.themes','Temalar'),('en','common','admin.themes','Themes'),
('tr','common','admin.plugins','Eklentiler'),('en','common','admin.plugins','Plugins'),
('tr','common','admin.languages','Diller'),('en','common','admin.languages','Languages'),
('tr','common','admin.products','Ürünler'),('en','common','admin.products','Products'),
('tr','common','admin.menus','Menüler'),('en','common','admin.menus','Menus'),
('tr','common','admin.orders','Siparişler'),('en','common','admin.orders','Orders'),
('tr','common','admin.leads','Talepler'),('en','common','admin.leads','Leads'),
('tr','common','admin.settings','Ayarlar'),('en','common','admin.settings','Settings');

-- plans
INSERT INTO public.plans (kind,slug,name,tagline,price_monthly,price_yearly,currency,features,limits,is_featured,sort_order) VALUES
('agent','agent-starter','Acente Başlangıç','Küçük ajanslar için',2490,24900,'TRY','["10 tenant hakkı","Restoran & menü temaları","Alt kullanıcı yönetimi","E-posta destek"]','{"tenants":10,"products_per_tenant":150,"branches_per_tenant":5}',false,1),
('agent','agent-pro','Acente Pro','Büyüyen ajanslar için',5990,59900,'TRY','["50 tenant hakkı","Tüm temalar","Tüm eklentiler","Öncelikli destek","Beyaz etiket"]','{"tenants":50,"products_per_tenant":1000,"branches_per_tenant":25}',true,2),
('tenant','tenant-basic','Marka Başlangıç','Tek şubeli işletmeler',490,4900,'TRY','["QR menü","Tek şube","100 ürün","Temel SEO"]','{"branches":1,"products":100,"languages":1}',false,3),
('tenant','tenant-growth','Marka Büyüme','Çok şubeli markalar',990,9900,'TRY','["QR menü + web sitesi","5 şube","500 ürün","Kampanyalar & blog","2 dil"]','{"branches":5,"products":500,"languages":2}',true,4),
('tenant','tenant-chain','Zincir','Restoran zincirleri',2490,24900,'TRY','["Sınırsız şube","Sınırsız ürün","Online sipariş","Çoklu dil","Özel alan adı"]','{"branches":-1,"products":-1,"languages":-1}',false,5);

-- themes
INSERT INTO public.themes (scope,slug,name,description,version,is_default,config) VALUES
('superadmin','theme-01','Saffron Sales','Koyu, premium SaaS satış teması','1.0.0',true,'{"accent":"saffron"}'),
('restaurant','theme-01','Anatolia','Koyu, sıcak tonlu restoran teması','1.0.0',true,'{"layout":"one-page"}'),
('restaurant','theme-02','Ivory','Aydınlık, minimal restoran teması','1.0.0',false,'{"layout":"one-page"}'),
('menu','theme-01','Pocket','Mobil öncelikli QR menü teması','1.0.0',true,'{"layout":"sticky-categories"}');

-- plugins
INSERT INTO public.plugins (scope,slug,name,description,version,manifest,permissions) VALUES
('tenant','whatsapp-orders','WhatsApp Sipariş','Sepeti WhatsApp üzerinden siparişe dönüştürür','1.0.0','{"settings":["phone","template"]}','["orders.create"]'),
('tenant','qr-generator','QR Kod Üretici','Şube ve masa bazlı QR kodları üretir','1.0.0','{"settings":["logo","format"]}','["menu.read"]'),
('tenant','reservations','Rezervasyon','Online masa rezervasyonu','1.0.0','{"settings":["capacity","slots"]}','["reservations.manage"]'),
('agent','bulk-onboarding','Toplu Tenant Kurulumu','Acenteler için toplu marka açma','1.0.0','{}','["tenants.create"]');

-- landing
INSERT INTO public.announcements (locale,message,link_label,link_href) VALUES
('tr','Yeni: Çoklu şube QR menü ve online sipariş yayında.','Planları incele','#plans');

INSERT INTO public.landing_sections (locale,key,eyebrow,title,subtitle,body,media_url,sort_order,config) VALUES
('tr','hero','Multitenant Restoran SaaS','Markanızın web sitesi ve QR menüsü tek panelden','Restoranlar, zincirler ve ajanslar için tema/eklenti tabanlı, çok dilli, güvenli bir platform.','Süper Admin → Acente → Marka hiyerarşisiyle sınırsız marka yönetin. Menü değişse de basılı QR kodunuz asla değişmez.','/__l5e/assets-v1/ed3e21a3-b16b-436c-9a2a-de03e3a16ac4/restaurant-hero.jpg',1,'{"primaryCta":"#plans","secondaryCta":"/anatolia"}'),
('tr','what','Nedir?','Tek altyapı, üç ayrı ön yüz','Satış sitesi, marka web sitesi ve QR menü aynı veri modelinden beslenir.',NULL,NULL,2,'{"badges":["Multitenant","RLS güvenliği","Tema sistemi","Eklenti sistemi","Çoklu dil","SEO"]}'),
('tr','features','Özellikler','Production için tasarlandı','Her içerik panelden yönetilir; hiçbir metin koda gömülü değildir.',NULL,NULL,3,'{}'),
('tr','how','Nasıl Çalışır?','Dört adımda yayında','Kurulum, içerik, tema, yayın.',NULL,NULL,4,'{"steps":[{"title":"Hesabınızı açın","text":"Süper admin ya da acente markanızı oluşturur."},{"title":"İçeriğinizi girin","text":"Şube, ürün, menü, kampanya ve haberleri panelden ekleyin."},{"title":"Temanızı seçin","text":"Web sitesi ve QR menü için ayrı tema seçin."},{"title":"Yayınlayın","text":"Tek tıkla yayına alın, QR kodunuzu bastırın."}]}'),
('tr','plans','Planlar','Acente ve marka planları','Kotalar sunucu tarafında da denetlenir.',NULL,NULL,5,'{}'),
('tr','faq','SSS','Sık sorulan sorular',NULL,NULL,NULL,6,'{}'),
('tr','contact','İletişim','Demo talep edin','Formu doldurun, size dönelim.',NULL,NULL,7,'{"email":"merhaba@qrsofra.com","phone":"+90 850 000 00 00"}');

INSERT INTO public.landing_features (locale,icon,title,description,sort_order) VALUES
('tr','layers','Multitenant mimari','Her markanın verisi veritabanı seviyesinde izole edilir.',1),
('tr','shield','Satır seviyesi güvenlik','Yetki kontrolü yalnızca arayüzde değil, veritabanında zorunlu.',2),
('tr','qr-code','Sabit QR kodu','İçerik değişse de basılı QR kod aynı kalır.',3),
('tr','palette','Tema ekosistemi','Satış sitesi, marka sitesi ve menü için ayrı tema setleri.',4),
('tr','puzzle','Eklenti sistemi','WhatsApp sipariş, rezervasyon, QR üretici ve fazlası.',5),
('tr','languages','Çoklu dil','Arayüz ve içerik çevirileri panelden yönetilir.',6),
('tr','store','Şube yönetimi','Zincirler için şube bazlı içerik, saat ve kampanya.',7),
('tr','search','SEO hazır','Meta, Open Graph, JSON-LD ve semantik yapı.',8);

INSERT INTO public.landing_faqs (locale,question,answer,sort_order) VALUES
('tr','Menümü değiştirince QR kodu yeniden bastırmam gerekir mi?','Hayır. QR kod sabit bir adrese işaret eder; içerik güncellendiğinde aynı adres güncel menüyü gösterir.',1),
('tr','Acente olarak kaç marka açabilirim?','Planınızdaki tenant kotası kadar. Kota aşımı sunucu ve veritabanı tarafında engellenir.',2),
('tr','Verilerim diğer markalardan izole mi?','Evet. Her tablo satır seviyesi güvenlik politikalarıyla korunur.',3),
('tr','Tema değiştirirsem içeriğim silinir mi?','Hayır. Tema yalnızca görünüm katmanıdır, veriler ortak modelde kalır.',4),
('tr','Online sipariş alabilir miyim?','Evet, sipariş özelliği marka bazında açılabilir; WhatsApp sipariş eklentisi de mevcuttur.',5),
('tr','Yeni dil eklenebilir mi?','Evet, panelden dil ekleyip çevirileri girmeniz yeterli; kod değişikliği gerekmez.',6);

INSERT INTO public.system_settings (key,value,is_public) VALUES
('brand','{"name":"QR Sofra","tagline":"Restoran SaaS Platformu","email":"merhaba@qrsofra.com","phone":"+90 850 000 00 00"}',true),
('demo','{"tenant_slug":"anatolia"}',true);

-- ===== demo tenant =====
INSERT INTO public.plans (kind,slug,name,tagline,price_monthly,currency,features,limits,is_active,sort_order)
VALUES ('agent','agent-internal','Dahili Acente','Sistem içi',0,'TRY','[]','{"tenants":100}',false,99);

INSERT INTO public.agents (id,name,slug,contact_email,plan_id,tenant_quota)
VALUES ('11111111-1111-4111-8111-111111111111','Sofra Dijital Ajans','sofra-dijital','ajans@qrsofra.com',(SELECT id FROM public.plans WHERE slug='agent-pro'),50);

INSERT INTO public.tenants (id,agent_id,plan_id,name,slug,status,is_published,default_locale)
VALUES ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111',(SELECT id FROM public.plans WHERE slug='tenant-chain'),'Anatolia Sofrası','anatolia','active',true,'tr');

INSERT INTO public.site_settings (tenant_id,hero_image_url,brand_color,accent_color,contact_phone,whatsapp,contact_email,address,map_embed_url,socials,topbar,order_enabled,seo_title,seo_description,og_image_url) VALUES
('22222222-2222-4222-8222-222222222222','/__l5e/assets-v1/ed3e21a3-b16b-436c-9a2a-de03e3a16ac4/restaurant-hero.jpg','#E8A33D','#C2410C','+90 212 000 00 00','+905550000000','merhaba@anatoliasofrasi.com','Kemankeş Mah. Karaköy, Beyoğlu / İstanbul','https://www.openstreetmap.org/export/embed.html?bbox=28.97%2C41.02%2C29.00%2C41.03&layer=mapnik','{"instagram":"https://instagram.com","facebook":"https://facebook.com","x":"https://x.com"}','{"enabled":true,"rows":[{"left":[{"type":"text","label":"Her gün 09:00 - 24:00"}],"center":[],"right":[{"type":"button","icon":"phone","label":"+90 212 000 00 00","href":"tel:+902120000000"},{"type":"lang"}]}]}',true,'Anatolia Sofrası | Karaköy & Kadıköy','Anadolu mutfağının modern yorumu. Menümüzü inceleyin, kampanyalarımızı kaçırmayın.','/__l5e/assets-v1/ed3e21a3-b16b-436c-9a2a-de03e3a16ac4/restaurant-hero.jpg');

INSERT INTO public.site_sections (tenant_id,key,eyebrow,title,subtitle,body,sort_order,config) VALUES
('22222222-2222-4222-8222-222222222222','about','Hakkımızda','1974''ten beri aynı ateş','Anadolu''nun yöresel tariflerini modern bir sofrada buluşturuyoruz.','Üç kuşaktır aynı ocakta pişen tarifler, günlük gelen malzemeler ve odun ateşi. Karaköy ve Kadıköy şubelerimizde sizi ağırlıyoruz.',1,'{"media":"gallery"}'),
('22222222-2222-4222-8222-222222222222','branches','Şubeler','Bize en yakın sofrayı seçin',NULL,NULL,2,'{}'),
('22222222-2222-4222-8222-222222222222','campaigns','Kampanyalar','Bu ayın fırsatları',NULL,NULL,3,'{}'),
('22222222-2222-4222-8222-222222222222','specials','Spesiyaller','Şefin seçtikleri',NULL,NULL,4,'{}'),
('22222222-2222-4222-8222-222222222222','posts','Haberler','Mutfaktan haberler',NULL,NULL,5,'{"label":"Haberler"}'),
('22222222-2222-4222-8222-222222222222','contact','İletişim','Rezervasyon ve iletişim',NULL,NULL,6,'{}');

INSERT INTO public.site_navigation (tenant_id,label,href,sort_order) VALUES
('22222222-2222-4222-8222-222222222222','Hakkımızda','#about',1),
('22222222-2222-4222-8222-222222222222','Şubeler','#branches',2),
('22222222-2222-4222-8222-222222222222','Kampanyalar','#campaigns',3),
('22222222-2222-4222-8222-222222222222','Menü','/anatolia/menu',4),
('22222222-2222-4222-8222-222222222222','Haberler','#posts',5),
('22222222-2222-4222-8222-222222222222','İletişim','#contact',6);

INSERT INTO public.slides (tenant_id,image_url,eyebrow,title,description,button_label,button_href,sort_order) VALUES
('22222222-2222-4222-8222-222222222222','/__l5e/assets-v1/ed3e21a3-b16b-436c-9a2a-de03e3a16ac4/restaurant-hero.jpg','Karaköy & Kadıköy','Odun ateşinde Anadolu mutfağı','Günlük hazırlanan mezeler, taş fırın lahmacun ve ocakbaşı kebaplar.','Menüyü Aç','/anatolia/menu',1),
('22222222-2222-4222-8222-222222222222','/__l5e/assets-v1/e160c8ea-79b7-4725-adf2-699088007de5/kebap.jpg','Şefin önerisi','Adana''dan gelen ateş','Elde kıyılmış et, közlenmiş biber, bulgur pilavı.','Spesiyalleri Gör','#specials',2);

INSERT INTO public.awards (tenant_id,title,description,icon,sort_order) VALUES
('22222222-2222-4222-8222-222222222222','Altın Kepçe 2024','Yılın Anadolu mutfağı restoranı','award',1),
('22222222-2222-4222-8222-222222222222','50 Yıllık Ocak','1974''ten beri kesintisiz hizmet','flame',2),
('22222222-2222-4222-8222-222222222222','4.8 / 5 Misafir Puanı','12.400+ değerlendirme','star',3);

INSERT INTO public.branches (id,tenant_id,name,slug,cover_image_url,address,city,phone,whatsapp,directions_url,opening_hours,socials,sort_order) VALUES
('33333333-3333-4333-8333-333333333331','22222222-2222-4222-8222-222222222222','Karaköy','karakoy','/__l5e/assets-v1/ed3e21a3-b16b-436c-9a2a-de03e3a16ac4/restaurant-hero.jpg','Kemankeş Mah. No:12, Beyoğlu','İstanbul','+90 212 000 00 00','+905550000000','https://maps.google.com/?q=Karakoy+Istanbul','[{"d":"Pzt-Cum","h":"09:00 - 24:00"},{"d":"Cmt-Paz","h":"10:00 - 01:00"}]','{"instagram":"https://instagram.com"}',1),
('33333333-3333-4333-8333-333333333332','22222222-2222-4222-8222-222222222222','Kadıköy','kadikoy','/__l5e/assets-v1/e160c8ea-79b7-4725-adf2-699088007de5/kebap.jpg','Caferağa Mah. No:3, Kadıköy','İstanbul','+90 216 000 00 00','+905550000001','https://maps.google.com/?q=Kadikoy+Istanbul','[{"d":"Her gün","h":"11:00 - 23:30"}]','{"instagram":"https://instagram.com"}',2);

INSERT INTO public.campaigns (tenant_id,branch_id,title,slug,excerpt,description,image_url,badge,category,starts_at,ends_at,sort_order) VALUES
('22222222-2222-4222-8222-222222222222',NULL,'2 Lahmacun 1 Ayran','2-lahmacun-1-ayran','Hafta içi 11:00-16:00 arası geçerli.','Taş fırın lahmacun siparişlerinde ikinci lahmacun ve ayran hediye. Paket servis hariç.','/__l5e/assets-v1/55a2c0f0-5809-496e-91a4-8c916ee63999/lahmacun.jpg','%40 indirim','Öğle',CURRENT_DATE - 5,CURRENT_DATE + 30,1),
('22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333331','Karaköy''e özel tatlı ikramı','karakoy-tatli','200 TL üzeri hesaplarda baklava ikramı.','Karaköy şubemizde geçerlidir, diğer kampanyalarla birleştirilemez.','/__l5e/assets-v1/06013ce0-9562-4650-bc41-d2c48f0ee9b7/baklava.jpg','Şubeye özel','Şube',CURRENT_DATE - 2,CURRENT_DATE + 14,2),
('22222222-2222-4222-8222-222222222222',NULL,'Ramazan Sofrası','ramazan-sofrasi','Kişi başı sabit fiyat iftar menüsü.','Çorba, ara sıcak, ana yemek ve tatlı dahil.','/__l5e/assets-v1/e160c8ea-79b7-4725-adf2-699088007de5/kebap.jpg','Sona erdi','Sezon',CURRENT_DATE - 120,CURRENT_DATE - 60,3);

INSERT INTO public.post_categories (id,tenant_id,name,slug,sort_order) VALUES
('44444444-4444-4444-8444-444444444441','22222222-2222-4222-8222-222222222222','Duyurular','duyurular',1),
('44444444-4444-4444-8444-444444444442','22222222-2222-4222-8222-222222222222','Mutfaktan','mutfaktan',2);

INSERT INTO public.posts (tenant_id,category_id,title,slug,excerpt,content,image_url,badge,status,published_at,view_count) VALUES
('22222222-2222-4222-8222-222222222222','44444444-4444-4444-8444-444444444441','Kadıköy şubemiz açıldı','kadikoy-subemiz-acildi','Caferağa''da yeni sofra sizi bekliyor.','<p>50. yılımızda ikinci şubemizi Kadıköy Caferağa''da açtık. Açılışa özel ilk hafta tüm tatlılarda %20 indirim uyguluyoruz.</p><p>Rezervasyon için şube telefonundan bize ulaşabilirsiniz.</p>','/__l5e/assets-v1/ed3e21a3-b16b-436c-9a2a-de03e3a16ac4/restaurant-hero.jpg','Yeni','published',now() - interval '3 days',412),
('22222222-2222-4222-8222-222222222222','44444444-4444-4444-8444-444444444442','Taş fırınımızın hikâyesi','tas-firin-hikayesi','Fırınımız 1974''ten beri aynı taşla çalışıyor.','<p>Fırınımızın taşı Nevşehir''den geldi ve 50 yıldır değişmedi. Günde ortalama 900 lahmacun aynı ateşte pişiyor.</p>','/__l5e/assets-v1/55a2c0f0-5809-496e-91a4-8c916ee63999/lahmacun.jpg','Hikâye','published',now() - interval '10 days',1180),
('22222222-2222-4222-8222-222222222222','44444444-4444-4444-8444-444444444442','Baklavamız artık günlük','baklava-gunluk','Antep fıstığıyla her sabah taze.','<p>Baklavalarımız artık her sabah şubede açılıyor. 40 kat yufka, %100 Antep fıstığı.</p>','/__l5e/assets-v1/06013ce0-9562-4650-bc41-d2c48f0ee9b7/baklava.jpg','Taze','published',now() - interval '20 days',760);

INSERT INTO public.menu_categories (id,tenant_id,name,slug,sort_order) VALUES
('55555555-5555-4555-8555-555555555551','22222222-2222-4222-8222-222222222222','Başlangıçlar','baslangiclar',1),
('55555555-5555-4555-8555-555555555552','22222222-2222-4222-8222-222222222222','Fırından','firindan',2),
('55555555-5555-4555-8555-555555555553','22222222-2222-4222-8222-222222222222','Ocakbaşı','ocakbasi',3),
('55555555-5555-4555-8555-555555555554','22222222-2222-4222-8222-222222222222','Tatlılar','tatlilar',4),
('55555555-5555-4555-8555-555555555555','22222222-2222-4222-8222-222222222222','İçecekler','icecekler',5);

INSERT INTO public.products (id,tenant_id,category_id,name,slug,short_description,description,price,image_url,badges,is_special,sort_order) VALUES
('66666666-6666-4666-8666-666666666661','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555551','Humus','humus','Nohut ezmesi, tahin, zeytinyağı','Elde ezilmiş nohut, tahin, limon ve sızma zeytinyağı ile.',145,'/__l5e/assets-v1/55a2c0f0-5809-496e-91a4-8c916ee63999/lahmacun.jpg','[{"label":"Vejetaryen","color":"emerald"}]',false,1),
('66666666-6666-4666-8666-666666666662','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555551','Ezme','ezme','Acılı domates ezmesi','Bıçakla doğranmış domates, biber, nar ekşisi.',125,'/__l5e/assets-v1/55a2c0f0-5809-496e-91a4-8c916ee63999/lahmacun.jpg','[{"label":"Acılı","color":"rose"}]',false,2),
('66666666-6666-4666-8666-666666666663','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555552','Taş Fırın Lahmacun','lahmacun','İnce hamur, elde kıyılmış et','40 saniyede odun ateşinde pişer. Limon ve maydanozla servis edilir.',95,'/__l5e/assets-v1/55a2c0f0-5809-496e-91a4-8c916ee63999/lahmacun.jpg','[{"label":"Çok tercih edilen","color":"amber"}]',true,3),
('66666666-6666-4666-8666-666666666664','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555552','Kaşarlı Pide','kasarli-pide','Bol kaşarlı, tereyağlı','Taş fırında, tereyağıyla parlatılarak servis edilir.',210,'/__l5e/assets-v1/55a2c0f0-5809-496e-91a4-8c916ee63999/lahmacun.jpg','[]',false,4),
('66666666-6666-4666-8666-666666666665','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555553','Adana Kebap','adana-kebap','Elde kıyılmış, acılı','Közlenmiş biber, bulgur pilavı ve lavaş ile.',420,'/__l5e/assets-v1/e160c8ea-79b7-4725-adf2-699088007de5/kebap.jpg','[{"label":"Şefin seçimi","color":"amber"},{"label":"Acılı","color":"rose"}]',true,5),
('66666666-6666-4666-8666-666666666666','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555553','Kuzu Şiş','kuzu-sis','Marine edilmiş kuzu','24 saat marine edilmiş kuzu eti, közde.',480,'/__l5e/assets-v1/e160c8ea-79b7-4725-adf2-699088007de5/kebap.jpg','[]',false,6),
('66666666-6666-4666-8666-666666666667','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555554','Antep Fıstıklı Baklava','baklava','40 kat yufka, günlük','Her sabah açılan yufka, %100 Antep fıstığı.',185,'/__l5e/assets-v1/06013ce0-9562-4650-bc41-d2c48f0ee9b7/baklava.jpg','[{"label":"Günlük","color":"emerald"}]',true,7),
('66666666-6666-4666-8666-666666666668','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555555','Türk Kahvesi','turk-kahvesi','Közde pişmiş','Lokum ile servis edilir.',75,'/__l5e/assets-v1/06013ce0-9562-4650-bc41-d2c48f0ee9b7/baklava.jpg','[]',false,8);

INSERT INTO public.product_features (tenant_id,product_id,label,value,icon,show_on_card,sort_order) VALUES
('22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666663','Kalori','320 kcal','flame',true,1),
('22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666663','Porsiyon','1 adet','utensils',false,2),
('22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666663','Hazırlanma','8 dk','clock',true,3),
('22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666665','Kalori','780 kcal','flame',true,1),
('22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666665','Acı seviyesi','Orta','chili',true,2),
('22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666667','Kalori','410 kcal','flame',true,1),
('22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666667','Alerjen','Fıstık, gluten','alert',false,2);

INSERT INTO public.menus (id,tenant_id,category_id,name,slug,short_description,description,price,image_url,badges,is_special,sort_order) VALUES
('77777777-7777-4777-8777-777777777771','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555553','İkili Ocakbaşı Menü','ikili-ocakbasi','2 kişilik kebap menüsü','Adana kebap, kuzu şiş, ezme, humus ve iki içecek.',990,'/__l5e/assets-v1/e160c8ea-79b7-4725-adf2-699088007de5/kebap.jpg','[{"label":"2 kişilik","color":"amber"}]',true,1),
('77777777-7777-4777-8777-777777777772','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555552','Lahmacun Menü','lahmacun-menu','2 lahmacun + ayran','İki taş fırın lahmacun, ezme ve ayran.',235,'/__l5e/assets-v1/55a2c0f0-5809-496e-91a4-8c916ee63999/lahmacun.jpg','[{"label":"Avantajlı","color":"emerald"}]',false,2),
('77777777-7777-4777-8777-777777777773','22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555554','Tatlı & Kahve','tatli-kahve','Baklava + Türk kahvesi','Antep fıstıklı baklava ve közde Türk kahvesi.',235,'/__l5e/assets-v1/06013ce0-9562-4650-bc41-d2c48f0ee9b7/baklava.jpg','[]',false,3);

INSERT INTO public.menu_products (menu_id,product_id,tenant_id,quantity,sort_order) VALUES
('77777777-7777-4777-8777-777777777771','66666666-6666-4666-8666-666666666665','22222222-2222-4222-8222-222222222222',1,1),
('77777777-7777-4777-8777-777777777771','66666666-6666-4666-8666-666666666666','22222222-2222-4222-8222-222222222222',1,2),
('77777777-7777-4777-8777-777777777771','66666666-6666-4666-8666-666666666662','22222222-2222-4222-8222-222222222222',1,3),
('77777777-7777-4777-8777-777777777771','66666666-6666-4666-8666-666666666661','22222222-2222-4222-8222-222222222222',1,4),
('77777777-7777-4777-8777-777777777772','66666666-6666-4666-8666-666666666663','22222222-2222-4222-8222-222222222222',2,1),
('77777777-7777-4777-8777-777777777772','66666666-6666-4666-8666-666666666662','22222222-2222-4222-8222-222222222222',1,2),
('77777777-7777-4777-8777-777777777773','66666666-6666-4666-8666-666666666667','22222222-2222-4222-8222-222222222222',1,1),
('77777777-7777-4777-8777-777777777773','66666666-6666-4666-8666-666666666668','22222222-2222-4222-8222-222222222222',1,2);

INSERT INTO public.theme_assignments (theme_id,tenant_id) VALUES
((SELECT id FROM public.themes WHERE scope='restaurant' AND slug='theme-01'),'22222222-2222-4222-8222-222222222222'),
((SELECT id FROM public.themes WHERE scope='menu' AND slug='theme-01'),'22222222-2222-4222-8222-222222222222');

INSERT INTO public.plugin_assignments (plugin_id,tenant_id,settings) VALUES
((SELECT id FROM public.plugins WHERE slug='whatsapp-orders'),'22222222-2222-4222-8222-222222222222','{"phone":"+905550000000"}'),
((SELECT id FROM public.plugins WHERE slug='qr-generator'),'22222222-2222-4222-8222-222222222222','{}');