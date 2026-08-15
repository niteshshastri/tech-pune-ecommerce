INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Laptops','laptops','New and pre-owned laptops for work, study and business.',1),
  ('Refurbished Laptops','refurbished-laptops','Professionally tested business-grade refurbished laptops.',2),
  ('Desktops','desktops','Desktop computers and workstations.',3),
  ('Monitors','monitors','Displays and monitors for home and office.',4),
  ('Accessories','accessories','Everyday computer accessories.',5),
  ('RAM','ram','Laptop and desktop memory modules.',6),
  ('SSDs','ssds','SATA and NVMe solid state drives.',7),
  ('Chargers & Adapters','chargers-adapters','Original laptop chargers and power adapters.',8),
  ('Keyboards & Mice','keyboards-mice','Wired and wireless keyboards, mice and combos.',9),
  ('Laptop Accessories','laptop-accessories','Sleeves, stands and other laptop add-ons.',10),
  ('Other IT Products','other-it-products','Other IT products and solutions.',11);

WITH seed(name, slug, brand, cond, cat_slug, price, spec_lines, needs_review) AS (
  VALUES
  ('Dell Latitude 7490','dell-latitude-7490-i7-16gb-256gb','Dell','refurbished','refurbished-laptops',27500,'Core i7 8th Generation|16GB RAM|256GB NVMe SSD|Intel UHD Graphics|14-inch FHD Display|Backlit keyboard|Windows 11 Pro|Original Adapter',false),
  ('Lenovo ThinkPad X390','lenovo-thinkpad-x390-i7-16gb-512gb','Lenovo','refurbished','refurbished-laptops',28500,'i7 8th Generation|16GB RAM|512GB NVMe SSD|Intel UHD Graphics|Backlit keyboard|13.3-inch FHD screen|Windows 11 Pro|Original Adapter|Slim and lightweight',false),
  ('Lenovo','lenovo-i3-2nd-gen-8gb-320gb','Lenovo','refurbished','refurbished-laptops',7000,'Intel Core i3 2nd Generation|8GB RAM|320GB HDD|Windows 10|15.6-inch screen',true),
  ('HP EliteBook 840 G5/G6','hp-elitebook-840-g5-g6-i5-8gb-256gb','HP','refurbished','refurbished-laptops',25000,'Intel Core i5 8th Generation|8GB RAM|256GB storage|14-inch FHD screen',true),
  ('Dell Latitude 5510','dell-latitude-5510-i5-16gb-512gb','Dell','refurbished','refurbished-laptops',35000,'Intel Core i5 10th Generation|16GB RAM|512GB SSD|15.6-inch FHD screen',false),
  ('HP EliteBook 840 G5/G6','hp-elitebook-840-g5-g6-i5-16gb-256gb','HP','refurbished','refurbished-laptops',25000,'Intel Core i5 8th Generation|16GB RAM|256GB SSD|Backlit keyboard|14-inch FHD screen|Metallic body|Windows 11 Pro|Original Adapter',false),
  ('HP EliteBook 840 G6','hp-elitebook-840-g6-i7-16gb-512gb','HP','refurbished','refurbished-laptops',29900,'Intel Core i7 8th Generation|16GB RAM|512GB SSD|Backlit keyboard|14-inch FHD screen|Metallic body|Windows 11 Pro|Original Adapter',false),
  ('HP EliteBook 840 G8 2-in-1','hp-elitebook-840-g8-2-in-1-i7-16gb-1tb','HP','refurbished','refurbished-laptops',54500,'360-degree convertible|Intel Core i7 11th Generation|16GB RAM|1TB SSD|Backlit keyboard|14-inch FHD screen|Metallic body|Windows 11 Pro|Original Adapter',false),
  ('HP ProBook 455 G8','hp-probook-455-g8-i5-8gb-512gb','HP','refurbished','refurbished-laptops',37500,'Intel Core i5 11th Generation|8GB RAM|512GB SSD|Backlit keyboard|15.6-inch HD screen|Metallic body|Windows 11 Pro|Original Adapter',false),
  ('HP EliteBook 830 G7 2-in-1','hp-elitebook-830-g7-2-in-1-i5-16gb-512gb','HP','refurbished','refurbished-laptops',41500,'Intel Core i5 10th Generation|16GB RAM|512GB SSD|Backlit keyboard|13.3-inch FHD touchscreen|2-in-1|Metallic body|Windows 11 Pro|Original Adapter',false),
  ('Dell Latitude 7490','dell-latitude-7490-i7-16gb-512gb','Dell','refurbished','refurbished-laptops',32000,'Intel Core i7 8th Generation|16GB RAM|512GB NVMe SSD',false),
  ('Dell Latitude 5400','dell-latitude-5400-i7-16gb-512gb','Dell','refurbished','refurbished-laptops',29500,'Intel Core i7 8th Generation|16GB RAM|512GB SSD|14-inch screen',false),
  ('HP EliteBook 840 G3','hp-elitebook-840-g3-8gb-256gb','HP','refurbished','refurbished-laptops',18500,'8GB RAM|256GB SSD',true),
  ('Lenovo ThinkPad X390','lenovo-thinkpad-x390-i5-16gb-512gb','Lenovo','refurbished','refurbished-laptops',21500,'Intel Core i5 8th Generation|16GB RAM|512GB NVMe SSD|Intel UHD Graphics|Backlit keyboard|13.3-inch FHD screen|Windows 11 Pro|Original Adapter|Slim and lightweight',false),
  ('Lenovo ThinkPad T470','lenovo-thinkpad-t470-i5-8gb-256gb','Lenovo','refurbished','refurbished-laptops',17500,'Intel Core i5 7th Generation|8GB RAM|256GB NVMe SSD|Intel UHD Graphics|Backlit keyboard|13.3-inch FHD screen|Windows 11 Pro|Original Adapter',true),
  ('Dell Latitude 5570','dell-latitude-5570-i5-8gb-256gb','Dell','refurbished','refurbished-laptops',18900,'Intel Core i5 7th Generation|8GB RAM|256GB SSD|15.6-inch screen',false),
  ('Wireless Keyboard Mouse KM3322W','wireless-keyboard-mouse-km3322w',NULL,'new','keyboards-mice',1099,'Model: KM3322W|Wireless keyboard and mouse combo',false),
  ('Kingstone 16GB RAM','kingstone-16gb-ram-pc4','Kingstone','new','ram',2100,'16GB|PC4 2666/3200MHz',true),
  ('HP CS10 Wireless Keyboard Mouse Combo','hp-cs10-wireless-keyboard-mouse-combo','HP','new','keyboards-mice',1250,'Wireless keyboard and mouse combo',false),
  ('Zebronics Wired Keyboard Mouse 555 Combo','zebronics-wired-keyboard-mouse-555-combo','Zebronics','new','keyboards-mice',499,'Wired keyboard and mouse combo',false),
  ('Original HP Adapter 65W','original-hp-adapter-65w-blue-pin','HP','new','chargers-adapters',900,'65W|Blue pin|4.5mm',false),
  ('Original Dell 65W AC Adapter','original-dell-65w-ac-adapter-round-big-pin','Dell','new','chargers-adapters',1200,'65W|Round big pin',false),
  ('Original Dell 65W Type-C Adapter','original-dell-65w-type-c-adapter','Dell','new','chargers-adapters',1500,'65W|Type-C',false),
  ('Original Dell 65W Small Pin Charger','original-dell-65w-small-pin-charger','Dell','new','chargers-adapters',1150,'65W|Small pin',false),
  ('Original Dell 65W Small Pin Charger','original-dell-65w-small-pin-charger-2','Dell','new','chargers-adapters',1000,'65W|Small pin',true),
  ('Original HP 65W Type-C Charger','original-hp-65w-type-c-charger','HP','new','chargers-adapters',1500,'65W|Type-C',false),
  ('Original Lenovo 65W Type-C Adapter','original-lenovo-65w-type-c-adapter','Lenovo','new','chargers-adapters',1000,'65W|Type-C',false),
  ('Original Lenovo 65W USB Adapter','original-lenovo-65w-usb-adapter','Lenovo','new','chargers-adapters',1000,'65W|USB pin',false),
  ('Original Lenovo 65W Small Pin Adapter','original-lenovo-65w-small-pin-adapter','Lenovo','new','chargers-adapters',1000,'65W|Small pin',false),
  ('Samsung 8GB DDR4 2666 RAM','samsung-8gb-ddr4-2666-ram','Samsung','new','ram',1350,'8GB|DDR4 2666MHz',false),
  ('Hynix 8GB DDR4 3200MHz Laptop RAM','hynix-8gb-ddr4-3200-laptop-ram','Hynix','new','ram',1350,'8GB|DDR4 3200MHz|Laptop RAM',false),
  ('EVM 512GB SATA SSD','evm-512gb-sata-ssd','EVM','new','ssds',2500,'512GB|SATA',false),
  ('EVM SATA 256GB SSD','evm-256gb-sata-ssd','EVM','new','ssds',1600,'256GB|SATA',false),
  ('EVM NVMe 512GB SSD','evm-512gb-nvme-ssd','EVM','new','ssds',2600,'512GB|NVMe',false),
  ('Samsung 512GB NVMe SSD','samsung-512gb-nvme-ssd','Samsung','new','ssds',3300,'512GB|NVMe',false),
  ('Original Dell Wireless Mouse','original-dell-wireless-mouse','Dell','new','keyboards-mice',650,'Wireless mouse',false),
  ('Original HP Wireless Mouse','original-hp-wireless-mouse','HP','new','keyboards-mice',590,'Wireless mouse',false),
  ('Laptop Sleeve','laptop-sleeve',NULL,'new','laptop-accessories',150,'Protective laptop sleeve',false),
  ('Metallic Laptop Stand','metallic-laptop-stand',NULL,'new','laptop-accessories',450,'Metallic laptop stand',false),
  ('Dell P2222H 22-inch Monitor','dell-p2222h-22-inch-monitor','Dell','new','monitors',5900,'22-inch|Model: P2222H',false),
  ('Dell 24-inch Borderless Monitor','dell-24-inch-borderless-monitor','Dell','new','monitors',8500,'24-inch|Borderless|IPS Display',false),
  ('Dell 27-inch Borderless Monitor','dell-27-inch-borderless-monitor','Dell','new','monitors',9900,'27-inch|Borderless|IPS Display',false)
)
INSERT INTO public.products (name, slug, brand, condition, category_id, price, specs, stock_state, stock_quantity, needs_review, short_description)
SELECT s.name, s.slug, s.brand, s.cond::public.product_condition, c.id, s.price,
  (SELECT COALESCE(jsonb_agg(jsonb_build_object('label','','value',line)), '[]'::jsonb)
     FROM unnest(string_to_array(s.spec_lines,'|')) AS line),
  'unverified'::public.stock_state, 0, s.needs_review,
  replace(s.spec_lines, '|', ' • ')
FROM seed s JOIN public.categories c ON c.slug = s.cat_slug;

INSERT INTO public.business_settings (business_name, phone, email, address, tagline, delivery_fee)
VALUES (
  'All Tech IT Solution',
  '8888436060',
  'alltechitsolutionpune@gmail.com',
  'Shree Laxmi Krupa Building, Bhairavnath Chowk, near Sadhna High School, Hadapsar, Pune, Maharashtra 411028, India',
  'Computers, laptops and IT solutions in Hadapsar, Pune',
  0
);