USE svk_website;

-- Categories with explicit IDs
INSERT INTO category (id, name) VALUES
  (1, 'all-items'),
  (2, 'robot-kits'),
  (3, 'educational-kits'),
  (4, 'robot-parts')
ON DUPLICATE KEY UPDATE name = VALUES(name);

ALTER TABLE category AUTO_INCREMENT = 5;

-- Item groups with explicit IDs
INSERT INTO item_group (id, name) VALUES
  (1, 'drones'),
  (2, '12V-motors'),
  (3, '6V-motors'),
  (4, '7.4V-batteries')
ON DUPLICATE KEY UPDATE name = VALUES(name);

ALTER TABLE item_group AUTO_INCREMENT = 5;

-- Cache commonly used IDs
SET @cat_all_items   = (SELECT id FROM category   WHERE name='all-items'        LIMIT 1);
SET @cat_robot_kits  = (SELECT id FROM category   WHERE name='robot-kits'       LIMIT 1);
SET @cat_edu_kits    = (SELECT id FROM category   WHERE name='educational-kits' LIMIT 1);
SET @cat_robot_parts = (SELECT id FROM category   WHERE name='robot-parts'      LIMIT 1);

SET @grp_drones      = (SELECT id FROM item_group WHERE name='drones'           LIMIT 1);
SET @grp_batt_2s_74v = (SELECT id FROM item_group WHERE name='7.4V-batteries'   LIMIT 1);

-- =========================
-- ARDUINO NANO
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock, description_short, price, weight, highlight
) VALUES (
  'Arduino Nano',
  'arduino-nano',
  NULL, NULL,
  @cat_robot_parts,
  1,
  'Arduino Nano Microcontroller',
  9.90,
  0,
  FALSE
);

SET @item_slug_name = 'arduino-nano';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/arduino_nano_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/arduino_nano_2-Photoroom.jpg');

COMMIT;

-- =========================
-- CHEETAH LINE FOLLOW
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock, description_short, description_full, price, weight, highlight
) VALUES (
  'Cheetah Line Follow',
  'cheetah-line-follow',
  'SVK18024', NULL,
  @cat_robot_kits,
  1,
  'Cheetah Line Follow Robot with 16 IR sensor array',
  ' # SVK Cheetah Line Follow Robot

The SVK Cheetah Robot, a Line Follow robot with a PCB (FFR4) chassis. Has an IR array of 16 IR Sensors, and comes with 1500 rpm motors. Can be extended with Turbo kit.',
  249.90,
  0,
  TRUE
);

SET @item_slug_name = 'cheetah-line-follow';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/cheetah_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/cheetah_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/cheetah_3-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/cheetah_4-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/cheetah_5-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/cheetah_6-Photoroom.jpg');

COMMIT;

-- =========================
-- CHEETAH TURBO KIT EXTENSION
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock, stock_status, description_short, description_full, price, weight, highlight
) VALUES (
  'Cheetah Line Follow Turbo Extension Kit',
  'cheetah-turbo-kit',
  'SVK18025', NULL,
  @cat_robot_kits,
  0,
  'currently_unavailable',
  'Cheetah Line Follow Turbo Extension Kit with Turbine and ESC',
  'The SVK Cheetah Line Follow Robot Extension kit, equipped with a Turbine, ESC, battery and the 3D printed parts needed to assemble it.',
  369.90,
  0,
  FALSE
);

SET @item_slug_name = 'cheetah-turbo-kit';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/Cheetah_Turbo_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Cheetah_Turbo_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Cheetah_Turbo_3-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Cheetah_Turbo_4-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Cheetah_Turbo_5-Photoroom.jpg');

COMMIT;

-- =========================
-- RFID UNO KIT
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock, description_short, price, weight, highlight
) VALUES (
  'Arduino Uno RFID Educational Kit',
  'educational-kit-rfid-uno',
  'SVK18026', NULL,
  @cat_edu_kits,
  1,
  'Complete Educational Arduino RFID Kit with Arduino Uno and all other basic components',
  43.90,
  0,
  TRUE
);

SET @item_slug_name = 'educational-kit-rfid-uno';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/arduino_kit_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/arduino_kit_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/arduino_kit_3-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/arduino_kit_4-Photoroom.jpg');

COMMIT;

-- =========================
-- SOCCER DRONE (BLUE)
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, group_id, stock, description_short, description_full, specifications, price, weight, highlight
) VALUES (
  'SVK Soccer Drone (Blue)',
  'soccer-drone-blue',
  'SVK18021',
  '88.062.190',
  @cat_robot_kits,
  @grp_drones,
  1,
  'Blue Soccer Drone used in Drone Soccer Sport',
  '# Drone Soccer

Experience the ultimate blend of action and fun with **Drone Soccer**! Combining the excitement of drone flying with the strategy of soccer, this product is perfect for tech enthusiasts and sports lovers alike. Equipped with advanced features and easy-to-use controls, **Drone Soccer** guarantees thrilling entertainment for individuals.

**Suitable for the MRC Robotics Competition - Drone Soccer Category!**

Designed to meet the requirements of the MRC, this **Drone Soccer** model provides all the essential features to participate and excel in robotics tournaments.

## **Key Features**

- **Durable Design:** Engineered for safe use, with protective guards around the propellers.
- **Versatile Flight Modes:** Adjustable speed levels (low, medium, high) and a headless mode for user-friendly operation.
- **RGB Lighting Effects:** Stunning lighting with 7 interchangeable colors.
- **User-Friendly Controls:** Simple remote control with fine-tuning options for precise movement.
- **Educational Value:** Enhance flying skills and strategic thinking with **Drone Soccer** gameplay.

## **Package Includes**

- Drone x1
- Remote control x1
- Battery 7.4V 600mAh x1
- USB Charger x1

## **Safety Features**

- **Suitable for outdoor use.**
- **Low battery voltage protection** to ensure safe operation.
- **Easy and secure charging system.**',
  '## **Technical Specifications**

- **Dimensions:** 200x200x180mm
- **Propeller Diameter:** 68mm
- **Takeoff Weight:** 108g
- **Flight time:** 6 minutes

[**Manual for Drone (English)**](/manuals/DRONE%20SOCCER%20(ENGLISH%20MANUAL).pdf)',
  134.90,
  800,
  TRUE
);

SET @item_slug_name = 'soccer-drone-blue';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/drone_blue_light-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/drone_blue-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/drone_accesories-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/drone_battery-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/drone_controller-Photoroom.jpg');

COMMIT;

-- =========================
-- SOCCER DRONE (RED)
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, group_id, stock, description_short, description_full, specifications, price, weight, highlight
) VALUES (
  'SVK Soccer Drone (Red)',
  'soccer-drone-red',
  'SVK18022',
  '88.062.190',
  @cat_robot_kits,
  @grp_drones,
  1,
  'Red Soccer Drone used in Drone Soccer Sport',
  '# Drone Soccer

[Same content as blue version omitted for brevity]',
  '## **Technical Specifications**

- **Dimensions:** 200x200x180mm
- **Propeller Diameter:** 68mm
- **Takeoff Weight:** 108g
- **Flight time:** 6 minutes

[**Manual for Drone (English)**](/manuals/DRONE%20SOCCER%20(ENGLISH%20MANUAL).pdf)',
  134.90,
  800,
  TRUE
);

SET @item_slug_name = 'soccer-drone-red';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/drone_red-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/drone_controller-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/drone_accesories-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/drone_battery-Photoroom.jpg');

COMMIT;

-- =========================
-- SVK IR 8 SENSOR ARRAY
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock, description_short, description_full, price, weight, highlight
) VALUES (
  'SVK IR 8 Sensor Array',
  'svk-ir-8-array',
  'SVK18027',
  NULL,
  @cat_robot_parts,
  1,
  'SVK Custom IR 8 Sensor Array for Follow Line Robots',
  ' # SVK IR Sensor Array

This 8 IR Sensor array is used on line follow robots to detect the black (or white) line. The IR sensors are analog, and a multiplexer is used to read the sensors correctly. You can find a complete Arduino library in our [Github Page](https://github.com/SVKROBOTICS/SVKTiger).',
  13.90,
  0,
  FALSE
);

SET @item_slug_name = 'svk-ir-8-array';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/IR_8_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/IR_8_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/IR_8_3-Photoroom.jpg');

COMMIT;

-- =========================
-- SCREW TERMINAL FOR UNO
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock, description_short, price, weight, highlight
) VALUES (
  'SVK Screw Terminal for Arduino Uno',
  'screw-terminal-uno',
  'SVK18028',
  NULL,
  @cat_robot_parts,
  1,
  'SVK Custom Screw Terminal made to fit Arduino Uno, for connecting jumper cables into it securely',
  5.90,
  0,
  FALSE
);

SET @item_slug_name = 'screw-terminal-uno';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/arduino_screw_module_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/arduino_screw_module_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/arduino_screw_module_3-Photoroom.jpg');

COMMIT;

-- =========================
-- SVK TIGER LINE FOLLOW
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock, description_short, price, weight, highlight
) VALUES (
  'SVK Tiger Line Follow',
  'svk-tiger',
  'SVK18023',
  NULL,
  @cat_robot_kits,
  1,
  'SVK Tiger Line Follow Robot, made with alluminium chassis',
  149.90,
  0,
  TRUE
);

SET @item_slug_name = 'svk-tiger';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/tiger_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/tiger_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/tiger_3-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/tiger_4-Photoroom.jpg');

COMMIT;

-- =========================
-- TIGER DRIVER
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock, description_short, price, weight, highlight
) VALUES (
  'Tiger Driver',
  'svk-tiger-driver',
  NULL,
  NULL,
  @cat_robot_parts,
  1,
  'SVK Tiger Motor Driver, made for controlling 2 motors and used on SVK Tiger Line follow Robot',
  50.00,
  0,
  FALSE
);

SET @item_slug_name = 'svk-tiger-driver';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/tiger_driver_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/tiger_driver_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/tiger_driver_3-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/tiger_driver_4-Photoroom.jpg');

COMMIT;

-- =========================
-- BATTERY 7.4V 2S 450mAh
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, group_id, stock, description_short, price, weight, highlight
) VALUES (
  'Lithium Battery 7.4 V 2S 450mAh',
  'li-battery-2S-450mAh',
  'SVK18029',
  NULL,
  @cat_robot_parts,
  @grp_batt_2s_74v,
  1,
  '7.4V 2S Lithium Battery with 450mAh, used in various projects and robots',
  9.90,
  0,
  FALSE
);

SET @item_slug_name = 'li-battery-2S-450mAh';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/BATTERY_450_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/BATTERY_450_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/BATTERY_450_3-Photoroom.jpg');

COMMIT;

-- =========================
-- BATTERY 7.4V 2S 300mAh
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, group_id, stock, description_short, price, weight, highlight
) VALUES (
  'Lithium Battery 7.4 V 2S 300 mAh',
  'li-battery-2S-300mAh',
  'SVK18030',
  NULL,
  @cat_robot_parts,
  @grp_batt_2s_74v,
  1,
  '7.4V 2S Lithium Battery with 300mAh, used in various projects and robots',
  10.90,
  0,
  FALSE
);

SET @item_slug_name = 'li-battery-2S-300mAh';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/BATTERY_300_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/BATTERY_300_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/BATTERY_300_3-Photoroom.jpg');

COMMIT;

-- =========================
-- JSUMO BLACK MAGIC MINI SUMO (+ variations)
-- =========================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock, description_short, description_full, specifications, price, weight, highlight
) VALUES (
  'JSUMO Black Magic Mini Sumo Robot Kit',
  'black-magic-mini-sumo',
  NULL, NULL,
  @cat_robot_kits,
  1,
  '7 Sensor // High Power Motors // Super Controller
Highest specs & highest quality.',
  '# Black Magic Mini Sumo Robot Kit

## **Robot Kit Includes**
- XMotion All in One Robot Board (Arduino Leonardo based high power Arduino based controller with motor drivers)
- JS40F Opponent Sensors x 5
- ML1 Line Sensors x 2
- Core 400 Rpm Micro Gearhead Dc Motors x 2
- JS2622 Wheels x 2
- LiPo Battery (7.4V 2S 300Mah)
- Blackmagic Steel Mini Sumo Chassis & Motor Mount
- Motor Cables & ML1 Cables.
- Screws
',
  '# Dimensions
- **Size(cm):** 10 x 10 x 10
- **Height(cm):** 3.5',
  389.90,
  0,
  TRUE
);

SET @item_slug_name = 'black-magic-mini-sumo';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/Black_Magic_Mini_Sumo_Robot_Kit_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Black_Magic_Mini_Sumo_Robot_Kit_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Black_Magic_Mini_Sumo_Robot_Kit_3-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Black_Magic_Mini_Sumo_Robot_Kit_4-Photoroom.jpg');

-- Exclusive variations
INSERT INTO item_variation (item_id, name, variation_price, selection_type) VALUES
  (@item_id, 'Core 6V 400RPM', 0.00, 'exclusive'),
  (@item_id, 'Core 6V 750RPM', 0.00, 'exclusive');

COMMIT;

-- Ensure group var for 12V motors exists (once per file is enough)
SET @grp_12v_motors = (SELECT id FROM item_group WHERE name='12V-motors' LIMIT 1);

-- =========================================================
-- JSUMO FLYING SHOGUN MINI SUMO
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO Flying Shogun Mini Sumo Robot Kit',
  'flying-shogun-mini-sumo',
  NULL, NULL,
  @cat_robot_kits,
  1,
  'Our tactical mini sumo kit, Shogun. Premium mini sumo robot kit with expandable features & simple assembly.',
  '# Flying Shogun Mini Sumo

## Designed with best materials. Aluminum black coated main body, high performance XMotion controller and Core series motors describe good crafted mini sumo robot.

## **Shogun Features**
Total 485 grams assembled under 500 Gr. for mini sumo, with extra 15grams you can add extra weights or suitable enclosures.
98x98mm under 10 cm width and length. Nearly 4cm low height (without flags).
High traction wheels with 2 gear motor fast manuevering design.
Steep angled wedge design for better leverage.

## **Robot Kit Includes**
XMotion V.2 Controller (6 Ampere Dual Outputs, Full Protection, Arduino Based)
JS40F Opponent Sensors x 4 (Up to 60 cm detection distance, Easy indicator led at backside)
Core 6V 400 Rpm Micro Gearhead Dc Motors x 2 (Most popular and high torque mini sumo robot motor)
Dark SLT20 Aluminum Wheels x 2 (Best for unvisibility to opponent robot''s sensors and have high traction)
LiPo Battery (11.1V 3S 450Mah) (Good option for overvoltaging motors)
MicroStart Module
JSumo Flag Mechanism
Shogun Aluminum Mini Sumo Chassis & Brass Motor Mount (CNC machined body parts)
M3 12mm Hex Socket Head Machine Screws x 8 (For Assembly of motor bracket)
M3 6mm Hex Socket Head Machine Screws x 2 (For Mounting XMotion to robot body)
12mm Standoffs x 2 (Used for placing XMotion board to body)
Minisumo Blade (Sharpened for best leverage of opponent robot)
Double Sided Tape (used for extra securing of gearmotors inside motor mounts)
Motor Cables  x 2
',
  '# Dimensions & Weight
- **Size(cm):** 9.8 x 9.8 x 9.8
- **Height(cm):** 18
- **Weight(Kg):** 0.48',
  379.90,
  480,
  TRUE
);

SET @item_slug_name = 'flying-shogun-mini-sumo';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/Flying_Shogun_Mini_Sumo_Robot_Kit-Photoroom1.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Flying_Shogun_Mini_Sumo_Robot_Kit-Photoroom2.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Flying_Shogun_Mini_Sumo_Robot_Kit-Photoroom3.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Flying_Shogun_Mini_Sumo_Robot_Kit-Photoroom4.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Flying_Shogun_Mini_Sumo_Robot_Kit-Photoroom5.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Flying_Shogun_Mini_Sumo_Robot_Kit-Photoroom6.jpg');

COMMIT;

-- =========================================================
-- JS40F DIGITAL DISTANCE SENSOR
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO JS40F Digital Distance Sensor',
  'js40f-digital-distance-sensor',
  NULL, NULL,
  @cat_robot_parts,
  1,
  'Specially designed digital distance sensor for mini sumo robots and small robot projects. It can detect objects from 40 cm (based on detecting area it can be up to 80cm!)',
  '# JS40F Digital Distance Sensor

## **Sensor Features**
- Reflective type infrared (IR) sensor that rely on beam reflection of front object.
- Works between 3.3V to 5V. At 5V sensor draws 15mA.
- Has a reverse polarity protection between voltage inputs (Power & GND)
- No manual setting for distance decrease.
- At backside, it has red led for detection status.
- Comes with 15cm stranded wire.
',
  '## **Dimensions & Weight**
- **Size:** 17.7mm Length x 11.5mm Width x 12.6mm Height
- **Weight:** Only 4 grams weight (including cables)

## **Cable Definitions**
They are same as industrial connection standards.
Brown: 5V
Blue: GND
Black: Signal Out',
  14.90,
  4,
  TRUE
);

SET @item_slug_name = 'js40f-digital-distance-sensor';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/JS40F_Digital_Distance_Sensor_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/JS40F_Digital_Distance_Sensor_2-Photoroom.jpg');

COMMIT;

-- =========================================================
-- PROFAST 12V 2000RPM (group: 12V-motors)
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, group_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO ProFast 12V 2000RPM',
  'profast-12v-2000rpm',
  'SVK18036', NULL,
  @cat_robot_parts,
  @grp_12v_motors,
  1,
  'The highest-speed DC motor model that we sell—highly recommended! A special motor for very fast line follower robots at an economical price.',
  '# High Efficiency & High Speed DC Motors for Line Follower (Micom) Robots.',
  '- **Model** Profast 2500 Rpm
- **Speed** 2000 Rpm (Revolution Per Minute)
- **Voltage** 12V
- **Overvoltageable?** Yes, Up to 18V
- **Gearbox Ratio** 12:1
- **Idle Current** 150 mA
- **Stall Current** 1200 mA
- **Dimensions** 48,7mm (Overall Length), 15mm x 15mm
- **Shaft Diameter & Length** 3mm x 8,26mm
- **Weight** 28 grams',
  17.90,
  28,
  FALSE
);

SET @item_slug_name = 'profast-12v-2000rpm';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/jsumo_12V_2000rpm_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/jsumo_12V_2000rpm_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/jsumo_12V_2000rpm_3-Photoroom.jpg');

COMMIT;

-- =========================================================
-- PROFAST 12V 3600RPM (group: 12V-motors)
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, group_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO ProFast 12V 3600RPM',
  'profast-12v-3600rpm',
  'SVK18035', NULL,
  @cat_robot_parts,
  @grp_12v_motors,
  1,
  'The highest-speed DC motor model that we sell—highly recommended! A special motor for very fast line follower robots at an economical price.',
  '# High Efficiency & High Speed DC Motors for Line Follower (Micom) Robots.',
  '- **Model** Profast 3600 Rpm
- **Speed** 3600 Rpm (Revolution Per Minute)
- **Voltage** 12V
- **Overvoltageable?** Yes, Up to 18V
- **Gearbox Ratio** 12:1
- **Idle Current** 150 mA
- **Stall Current** 1200 mA
- **Dimensions** 48,7mm (Overall Length), 15mm x 15mm
- **Shaft Diameter & Length** 3mm x 8,26mm
- **Weight** 28 grams',
  17.90,
  28,
  FALSE
);

SET @item_slug_name = 'profast-12v-3600rpm';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/MOTOR_3600_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/MOTOR_3600_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/MOTOR_3600_3-Photoroom.jpg');

COMMIT;

-- =========================================================
-- PROFAST 12V 4000RPM (group: 12V-motors)
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, group_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO ProFast 12V 4000RPM',
  'profast-12v-4000rpm',
  'SVK18034', NULL,
  @cat_robot_parts,
  @grp_12v_motors,
  1,
  'The highest-speed DC motor model that we sell—highly recommended! A special motor for very fast line follower robots at an economical price.',
  '# High Efficiency & High Speed DC Motors for Line Follower (Micom) Robots.',
  '- **Model** Profast 5000 Rpm
- **Speed** 4000 Rpm (Revolution Per Minute)
- **Voltage** 12V
- **Overvoltageable?** Yes, Up to 15V(4 Cell Lipo Max)
- **Gearbox Ratio** 7.5:1
- **Idle Current** 150 mA
- **Stall Current** 2400 mA
- **Dimensions** 58,7mm (Overall Length), 15mm x 15mm
- **Shaft Diameter & Length** 3mm x 18,26mm
- **Weight** 28 grams',
  17.90,
  28,
  FALSE
);

SET @item_slug_name = 'profast-12v-4000rpm';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/jsumo_12V_4000rpm_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/jsumo_12V_4000rpm_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/jsumo_12V_4000rpm_3-Photoroom.jpg');

COMMIT;

-- Ensure group var for 6V motors exists
SET @grp_6v_motors = (SELECT id FROM item_group WHERE name='6V-motors' LIMIT 1);

-- =========================================================
-- PROFAST 12V 5900RPM (group: 12V-motors)
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, group_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO ProFast 12V 5900RPM',
  'profast-12v-5900rpm',
  'SVK18031', NULL,
  @cat_robot_parts,
  @grp_12v_motors,
  1,
  'The highest-speed DC motor model that we sell—highly recommended! A special motor for very fast line follower robots at an economical price.',
  '# High Efficiency & High Speed DC Motors for Line Follower (Micom) Robots.',
  '- **Model**     Profast 5900 Rpm
- **Speed**     5900 Rpm (Revolution Per Minute)
- **Voltage**   12V
- **Overvoltageable?**  Yes, Up to 18V
- **Gearbox Ratio**     12:1
- **Idle Current**      150 mA
- **Stall Current**     1200 mA
- **Dimensions**	      48,7mm (Overall Length), 15mm x 15mm
- **Shaft Diameter & Length**	3mm x 8,26mm
- **Weight**	          28 grams',
  17.90,
  28,
  FALSE
);

SET @item_slug_name = 'profast-12v-5900rpm';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/MOTOR_5900_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/MOTOR_5900_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/MOTOR_5900_3-Photoroom.jpg');

COMMIT;

-- =========================================================
-- CORE DC MOTOR (6V 400 RPM)  (group: 6V-motors)
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, group_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO Core Dc Motor (6V 400 RPM)',
  'core-dc-motor-6v-400rpm',
  NULL, NULL,
  @cat_robot_parts,
  @grp_6v_motors,
  1,
  'Little bigger size and little higher power for super power mini sumo robots.',
  '## Our Most Popular Mini-Sumo Robot Motors

Mini-sumo robot tournaments are becoming increasingly competitive, making it difficult to outpace other players. You need high-quality motors that are durable, capable of withstanding wear and tear, and built to last. These motors will also help make your robots more agile and powerful.

These motors have a speed of 400 RPM at 6V. (We also offer a faster model with the same design – the Core 6V 750 RPM). The speed and torque balance is very well achieved. You can increase the applied voltage up to 15V. **Using a 3S or 4S LiPo battery is fine for short durations**.

The motor diameter is 15mm **(many projects use 12mm motors, but a larger diameter provides more power)**. The overall length, including the shaft, is 47mm. There''s no need to cut the shaft!

The motor shaft has a length of 12mm and a thickness of 3mm.

When operating at 6V, the motor draws an operating current of 120mA, with a stall current of 3.2A. The stall torque is 3.9kg-cm, while the working torque is 1.2kg-cm. The weight of the gear motor is 21 grams.

Please note: We are not responsible for any damage caused to the opponent''s robot if the voltage applied exceeds 12V. These are the best motors we''ve tested for mini-sumo projects!',
  '## **Dimensions & Weight**
- **Size(cm):** 1.5 x 1.5 x 1.5
- **Height(cm):** 5
- **Weight(Kg):** 0.03',
  18.90,
  3,
  FALSE
);

SET @item_slug_name = 'core-dc-motor-6v-400rpm';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/jsumo_dc_6v_400_rpm_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/jsumo_dc_6v_400_rpm_2-Photoroom.jpg');

COMMIT;

-- =========================================================
-- CORE DC MOTOR (6V 750 RPM)  (group: 6V-motors)
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, group_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO Core Dc Motor (6V 750RPM)',
  'core-dc-motor-6v-750rpm',
  NULL, NULL,
  @cat_robot_parts,
  @grp_6v_motors,
  1,
  'Little bigger size and little higher power for super power mini sumo robots.',
  '## Our Most Popular Mini-Sumo Robot Motors

Mini-sumo robot tournaments are becoming increasingly competitive, making it difficult to outpace other players. You need high-quality motors that are durable, capable of withstanding wear and tear, and built to last. These motors will also help make your robots more agile and powerful.

These motors have a speed of 750 RPM at 6V. (We have one model slower at same design – Core 6V 400 Rpm). The speed and torque balance is very well achieved. You can increase the applied voltage up to 15V. **Using a 3S or 4S LiPo battery is fine for short durations**.

The motor diameter is 15mm **(many projects use 12mm motors, but a larger diameter provides more power)**. The overall length, including the shaft, is 47mm. There''s no need to cut the shaft!

Motor shaft (shaft) Length 12mm thickness 3mm shaft section.

When operating at 6V, the motor draws an operating current of 120mA, with a stall current of 3.5A. The stall torque is 2.8kg-cm, while the working torque is 0.95kg-cm. The weight of the gear motor is 21 grams.

Please note: We are not responsible for any damage caused to the opponent''s robot if the voltage applied exceeds 12V. These are the best motors we''ve tested for mini-sumo projects!',
  '## **Dimensions & Weight**
- **Size(cm):** 1.5 x 1.5 x 1.2
- **Height(cm):** 5.2
- **Weight(Kg):** 0.03',
  18.90,
  3,
  FALSE
);

SET @item_slug_name = 'core-dc-motor-6v-750rpm';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/jsumo_dc_6v_750_rpm_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/jsumo_dc_6v_750_rpm_2-Photoroom.jpg');

COMMIT;

-- =========================================================
-- OFFICIAL MICROSTART SUMO & MINISUMO ROBOT START MODULE
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO Official MicroStart Sumo & Minisumo Robot Start Module',
  'microstart-sumo-minisumo-robot-start-module',
  'SVK18033', NULL,
  @cat_robot_parts,
  1,
  'Micro start module for sumo robot and mini sumo robot projects. It is very versatile with easy usage.',
  'Signal Recording Start module for minisumo and sumo robot projects. **You can use any type SONY remotes with smart MicroStart. Easier than use to robots with two leds (Red Led Stop, Blue Led Start)**.

## **Features**
- Works at 5V & 3.3V (Suitable for Arduino, mBed, Psoc, Pic, Atmel based systems)
- Small Size (12.6mm x 15.4mm x 8 mm)
- Two LEDS: Blue (Start) LED, Red (Stop) LED
- Just 2 grams.

## **How to Use MicroStart?**
Open the robot while Microstart is attached to suitable pins (Any digital pin is Ok)
First you need to record release, start and stop signals of remote (Three different buttons, three signals)
Push the MicroStart''s white button 1 second, module will pass the recording mode (Both LEDs will slowly blink 3 times)
Push the first button of remote (It will be release - unlock button) First led (RED LED) will light up.
Wait 1-2 seconds.
Push the second button of remote (It will be Start button) second led (Blue LED) will light up.
Wait 1-2 seconds again.
Push the third button of remote (It will be Stop button). Both led will blink fastly 4 times and turn off.
Now MicroStart is ready for receiving signal.',
  '## **Dimensions & Weight**
- **Size(cm):** 1.6 x 1.6 x 1.3
- **Height(cm):** 1
- **Weight(Kg):** 0.01',
  8.70,
  1,
  FALSE
);

SET @item_slug_name = 'microstart-sumo-minisumo-robot-start-module';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/Jusmo_Robot_Start_Module_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Jusmo_Robot_Start_Module_2-Photoroom.jpg');

COMMIT;

-- =========================================================
-- MICROSTART REMOTE
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO Microstart Remote',
  'microstart-remote',
  NULL, NULL,
  @cat_robot_parts,
  1,
  'The Microstart controller is an innovative revolutionary controller designed by Jsumo with guidance of Japan Referees.',
  '**The Microstart controller is an innovative revolutionary controller designed by Jsumo with guidance of Japan Referees**.

It is designed to be used in robot competitions, especially in sumo and mini sumo robot matches. **It is convenient to use with Microstart receiver**.

## **With clear OLED screen, no more guessing, no more rethinking! We worked hard for making more easier than ever**.

### **Features of MicroStart Remote**
Remote allows you to control different dohyo numbers (unlocking, starting and stopping) with the buttons on the remote.
**In addition, remote holds data of how many matches held on the statistics page**. Referees can easily see and ctiricize datas.
The battery voltage is live on the OLED display. You can check such battery charge. The Microstart remote will alert you when the batteries are empty or if they fall below the critical voltage.
**There are 3 powerful wide angle infrared leds on the remote**, in addition, there are extra led outputs on the left and right side of the card. These outputs can be connected directly to infrared extra leds (Resistors are added on the circuit, you need to only attach extra LEDs or Led Guns if needed).

To understand how this remote works, [watch this video](https://www.youtube.com/watch?v=yb8Buvjdq7s).',
  '## **Dimensions & Weight**
- 67.5 grams with batteries (Batteries not included)
- 101mm x 57mm x 20mm',
  34.90,
  70,
  FALSE
);

SET @item_slug_name = 'microstart-remote';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/Micro_remote_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Micro_remote_2-Photoroom.jpg');

COMMIT;

-- =========================================================
-- JSUMO SHOGUN MINI SUMO ROBOT KIT
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO Shogun Mini Sumo Robot Kit',
  'shogun-mini-sumo-robot-kit-full-kit-not-assembled',
  NULL, NULL,
  @cat_robot_kits,
  1,
  'Our tactical mini sumo kit, Shogun. Premium mini sumo robot kit with expandable features & simple assembly.',
  '# Our tactical mini sumo kit, Shogun. Premium mini sumo robot kit with expandable features & simple assembly.

Designed with best materials. Aluminum black coated main body, high performance XMotion controller and Core series motors describe good crafted mini sumo robot.

## **Shogun Features**
Total 436 grams assembled under 500 Gr. for mini sumo, with extra 64 grams you can add mechanisms, extra weights or suitable enclosures.
98x98mm under 10 cm width and length. Nearly 4cm low height.
High traction wheels with 2 gear motor fast manuevering design.
Steep angled wedge design for better leverage.

## **Robot Kit Includes**
XMotion V.2 Controller (6 Ampere Dual Outputs, Full Protection, Arduino Based)
JS40F Opponent Sensors x 4 (Up to 60 cm detection distance, Easy indicator led at backside)
Core 6V 400 Rpm Micro Gearhead Dc Motors x 2 (Most popular and high torque mini sumo robot motor)
Dark SLT20 Aluminum Wheels x 2 (Best for unvisibility to opponent robot''s sensors and have high traction)
LiPo Battery (11.1V 3S 450Mah) (Good option for overvoltaging motors)
Shogun Aluminum Mini Sumo Chassis & Brass Motor Mount (CNC machined body parts)
M3 12mm Hex Socket Head Machine Screws x 8 (For Assembly of motor bracket)
M3 6mm Hex Socket Head Machine Screws x 2 (For Mounting XMotion to robot body)
12mm Standoffs x 2 (Used for placing XMotion board to body)
Minisumo Blade (Sharpened for best leverage of opponent robot)
Double Sided Tape (used for extra securing of gearmotors inside motor mounts)
Motor Cables x 2

### **Optional Parts**
Lipo Battery Charger (We recommend E3 Charger)
Microstart Start Module
Start Remote',
  '## **Dimensions & Weight**
- **Size(cm):** 9.8 x 9.8 x 9.8
- **Height(cm):** 4
- **Weight(Kg):** 0.43',
  359.90,
  430,
  TRUE
);

SET @item_slug_name = 'shogun-mini-sumo-robot-kit-full-kit-not-assembled';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/Shogun_Mini_Sumo_Robot_Kit-Photoroom1.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Shogun_Mini_Sumo_Robot_Kit-Photoroom2.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Shogun_Mini_Sumo_Robot_Kit-Photoroom3.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Shogun_Mini_Sumo_Robot_Kit-Photoroom4.jpg');

COMMIT;

-- =========================================================
-- JSUMO SONY REMOTE FOR MICROSTART START MODULE
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO Sony Remote For MicroStart Start Module',
  'sony-remote-for-microstart-start-module',
  NULL, NULL,
  @cat_robot_parts,
  1,
  'Suitable TV Remote for our MicroStart start module.',
  'Sony TV Remote for our popular MicroStart start module.
Can be used for starting mini sumos and sumo robots.
This remote is used at lots of robot competition very well. Works from long range too (works from 20-meter range)',
  '## **Dimensions & Weight**
- **Size(cm):** 15 x 15 x 4
- **Height(cm):** 2
- **Weight(Kg):** 0.1',
  6.90,
  100,
  FALSE
);

SET @item_slug_name = 'sony-remote-for-microstart-start-module';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/Micro_remote_start_module_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Micro_remote_start_module_2-Photoroom.jpg');

COMMIT;

-- =========================================================
-- JSUMO XMOTION ALL IN ONE CONTROLLER V3
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO XMotion All In One Controller V3',
  'xmotion-robot-controller',
  'SVK18032', NULL,
  @cat_robot_parts,
  1,
  'XMotion is Arduino Compatible all in one robot controller. Which designed specially for robotics, IOT and maker projects.',
  '# Introducing XMOTION
**XMotion** is Arduino Compatible all in one robot controller. Which designed specially for robotics, IOT and maker projects.

It includes powerful Motor drivers, switching mode regulator, interface circuits and more. With protected features, it is all in one board for lots of different type robot projects.

But not only this. Also we added some supporting materials, like starter codes, libraries. If you want to do line follower, mini-sumo or any basic robot we have ready-made codes for beginners.

# ONE BOARD TO RULE THEM ALL!

## The problem with other boards
At first glance if you plan to do robotics projects (For educational or hobby projects) there is lots of controller boards In market, but this boards are not practical and user friendly. At same time they are not giving same performance specs as XMotion. 8x3 cm size comes very handy for all projects.

Secondly, XMotion''s developing potential is huge! If you work for robot project, always you need to aim the highest. XMotion gives you this chance.

## The XMotion Impact
First of all it is Arduino compatible! **VERY EASY TO PROGRAM WITH ARDUINO SOFTWARE**.

## What is that strong features?
**Small dimension**. It was very important factor at our design, small but at same time stabilized design. We managed to make 80 x 30 x7 mm dimension board without rectricts.
**6 Ampere x 2 Motor drive outputs**. High current, protected for short circuits.
**Reverse connection protection** on input.
**Built-in regulator up to 24V** (vs ~15V on generic boards).
Arduino Leonardo bootloaded **ATMEGA32U4**, programmable via micro USB.
User **trimpot, button & dipswitch** on board.
Up to **9 sensors** attachable via through-hole IO pads.',
  '## **Dimensions & Weight**
- **Size(cm):** 8 x 8 x 3
- **Height(cm):** 1.2
- **Weight(Kg):** 0.013',
  61.90,
  13,
  TRUE
);

SET @item_slug_name = 'xmotion-robot-controller';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/X_motion_module_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/X_motion_module_2-Photoroom.jpg');

COMMIT;

-- =========================================================
-- JSUMO XS1 MICRO SUMO ROBOT KIT
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO XS1 Micro Sumo Robot Kit',
  'xs1-micro-sumo-robot-kit',
  NULL, NULL,
  @cat_robot_kits,
  1,
  'The XS1 Micro Sumo Robot Kit is a great way to begin in the world of micro sumo robots.',
  'The XS1 Micro Sumo Robot Kit is a great way to begin in the world of micro sumo robots.

It will challenge you to think up new and creative ways to win your opponents. With 4 sensors (3 Opponent Sensor, 1 Line Sensor) and 2 gear motors built-in, we''ve made it easy for you to work and build your own robot and go head-to-head with opponents.

You can even program your robots with the XMotion Micro Controller based on Arduino software. (Arduino Leonardo bootloaded mcu)

The XS1 is under 100 grams and under 5 cm in length, height and width (fits to all official micro sumo robot rules).

Each body part is specially designed for basic assembly and fast fixing if needed between robot matches.

## **Technical Features of Micro Sumo Robot Kit**
49mm width, 49.5mm length, 47mm height.
94 grams weight

You''ll receive a complete micro sumo robot kit ready for battle. The XS1 is the first in a series of made-for-fun micro sumo robots. It''s designed to be small & portable so you can take it with you.

What''s more, the XS1 is completely customizable. Paint with your own style. Attach extra modules like bluetooth or robot start module.

# Hardware
### **XMotion Micro Robot Controller Board**
Micro-sized controller (ATmega32u4, dual 1A driver), 7–15V, Arduino IDE via micro USB. 2 user buttons, 2 user LEDs.

### **JS40F Infrared Opponent Sensors**
3× JS40F digital IR sensors (up to 60cm), placed front/left/right for wide coverage.

### **ML1 Line, Edge Sensor**
Analog sensor for dohyo edge detection.

### **DC Micro Gear Motors**
Strong 6V gear motors (overvoltage up to 12V).

### **Body Parts**
3 precision plastic parts; serviceable with four M2 screws.

### **Blade**
10mm width, 0.3mm thickness double-sharpened; 20° support angle.

### **Super Grip & Light Silicone Wheels**
High-traction silicone; recommended IPA cleaning between matches.

## **Software**
Well-commented Arduino code provided. Beginner-friendly and tournament-ready; extend as needed.
[Blog code walkthrough](https://blog.jsumo.com/xs1-micro-sumo-arduino-code-explanation-of-the-robot-code/)',
  '## **Dimensions & Weight**
- **Size(cm):** 5 x 5 x 5
- **Height(cm):** 5
- **Weight(Kg):** 0.1',
  124.90,
  100,
  TRUE
);

SET @item_slug_name = 'xs1-micro-sumo-robot-kit';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/XS1_Micro_Sumo_Robot_Kit_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/XS1_Micro_Sumo_Robot_Kit_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/XS1_Micro_Sumo_Robot_Kit_3-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/XS1_Micro_Sumo_Robot_Kit_4-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/XS1_Micro_Sumo_Robot_Kit_5-Photoroom.jpg');

COMMIT;

-- =========================================================
-- JSUMO SHOGUN MINI SUMO ROBOT KIT
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO Shogun Mini Sumo Robot Kit',
  'shogun-mini-sumo-robot-kit-full-kit-not-assembled',
  NULL, NULL,
  @cat_robot_kits,
  1,
  'Our tactical mini sumo kit, Shogun. Premium mini sumo robot kit with expandable features & simple assembly.',
  '# Our tactical mini sumo kit, Shogun. Premium mini sumo robot kit with expandable features & simple assembly.

Designed with best materials. Aluminum black coated main body, high performance XMotion controller and Core series motors describe good crafted mini sumo robot.

## **Shogun Features**
Total 436 grams assembled under 500 Gr. for mini sumo, with extra 64 grams you can add mechanisms, extra weights or suitable enclosures.
98x98mm under 10 cm width and length. Nearly 4cm low height.
High traction wheels with 2 gear motor fast manuevering design.
Steep angled wedge design for better leverage.

## **Robot Kit Includes**
XMotion V.2 Controller (6 Ampere Dual Outputs, Full Protection, Arduino Based)
JS40F Opponent Sensors x 4 (Up to 60 cm detection distance, Easy indicator led at backside)
Core 6V 400 Rpm Micro Gearhead Dc Motors x 2 (Most popular and high torque mini sumo robot motor)
Dark SLT20 Aluminum Wheels x 2 (Best for unvisibility to opponent robot''s sensors and have high traction)
LiPo Battery (11.1V 3S 450Mah) (Good option for overvoltaging motors)
Shogun Aluminum Mini Sumo Chassis & Brass Motor Mount (CNC machined body parts)
M3 12mm Hex Socket Head Machine Screws x 8 (For Assembly of motor bracket)
M3 6mm Hex Socket Head Machine Screws x 2 (For Mounting XMotion to robot body)
12mm Standoffs x 2 (Used for placing XMotion board to body)
Minisumo Blade (Sharpened for best leverage of opponent robot)
Double Sided Tape (used for extra securing of gearmotors inside motor mounts)
Motor Cables x 2

### **Optional Parts**
Lipo Battery Charger (We recommend E3 Charger)
Microstart Start Module
Start Remote',
  '## **Dimensions & Weight**
- **Size(cm):** 9.8 x 9.8 x 9.8
- **Height(cm):** 4
- **Weight(Kg):** 0.43',
  359.90,
  430,
  TRUE
);

SET @item_slug_name = 'shogun-mini-sumo-robot-kit-full-kit-not-assembled';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/Shogun_Mini_Sumo_Robot_Kit-Photoroom1.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Shogun_Mini_Sumo_Robot_Kit-Photoroom2.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Shogun_Mini_Sumo_Robot_Kit-Photoroom3.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Shogun_Mini_Sumo_Robot_Kit-Photoroom4.jpg');

COMMIT;

-- =========================================================
-- JSUMO SONY REMOTE FOR MICROSTART START MODULE
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO Sony Remote For MicroStart Start Module',
  'sony-remote-for-microstart-start-module',
  NULL, NULL,
  @cat_robot_parts,
  1,
  'Suitable TV Remote for our MicroStart start module.',
  'Sony TV Remote for our popular MicroStart start module.
Can be used for starting mini sumos and sumo robots.
This remote is used at lots of robot competition very well. Works from long range too (works from 20-meter range)',
  '## **Dimensions & Weight**
- **Size(cm):** 15 x 15 x 4
- **Height(cm):** 2
- **Weight(Kg):** 0.1',
  6.90,
  100,
  FALSE
);

SET @item_slug_name = 'sony-remote-for-microstart-start-module';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/Micro_remote_start_module_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/Micro_remote_start_module_2-Photoroom.jpg');

COMMIT;

-- =========================================================
-- JSUMO XMOTION ALL IN ONE CONTROLLER V3
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO XMotion All In One Controller V3',
  'xmotion-robot-controller',
  'SVK18032', NULL,
  @cat_robot_parts,
  1,
  'XMotion is Arduino Compatible all in one robot controller. Which designed specially for robotics, IOT and maker projects.',
  '# Introducing XMOTION
**XMotion** is Arduino Compatible all in one robot controller. Which designed specially for robotics, IOT and maker projects.

It includes powerful Motor drivers, switching mode regulator, interface circuits and more. With protected features, it is all in one board for lots of different type robot projects.

But not only this. Also we added some supporting materials, like starter codes, libraries. If you want to do line follower, mini-sumo or any basic robot we have ready-made codes for beginners.

# ONE BOARD TO RULE THEM ALL!

## The problem with other boards
At first glance if you plan to do robotics projects (For educational or hobby projects) there is lots of controller boards In market, but this boards are not practical and user friendly. At same time they are not giving same performance specs as XMotion. 8x3 cm size comes very handy for all projects.

Secondly, XMotion''s developing potential is huge! If you work for robot project, always you need to aim the highest. XMotion gives you this chance.

## The XMotion Impact
First of all it is Arduino compatible! **VERY EASY TO PROGRAM WITH ARDUINO SOFTWARE**.

## What is that strong features?
**Small dimension**. It was very important factor at our design, small but at same time stabilized design. We managed to make 80 x 30 x7 mm dimension board without rectricts.
**6 Ampere x 2 Motor drive outputs**. High current, protected for short circuits.
**Reverse connection protection** on input.
**Built-in regulator up to 24V** (vs ~15V on generic boards).
Arduino Leonardo bootloaded **ATMEGA32U4**, programmable via micro USB.
User **trimpot, button & dipswitch** on board.
Up to **9 sensors** attachable via through-hole IO pads.',
  '## **Dimensions & Weight**
- **Size(cm):** 8 x 8 x 3
- **Height(cm):** 1.2
- **Weight(Kg):** 0.013',
  61.90,
  13,
  TRUE
);

SET @item_slug_name = 'xmotion-robot-controller';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/X_motion_module_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/X_motion_module_2-Photoroom.jpg');

COMMIT;

-- =========================================================
-- JSUMO XS1 MICRO SUMO ROBOT KIT
-- =========================================================
START TRANSACTION;

INSERT INTO item (
  name, slug, product_code, hs_code, category_id, stock,
  description_short, description_full, specifications,
  price, weight, highlight
) VALUES (
  'JSUMO XS1 Micro Sumo Robot Kit',
  'xs1-micro-sumo-robot-kit',
  NULL, NULL,
  @cat_robot_kits,
  1,
  'The XS1 Micro Sumo Robot Kit is a great way to begin in the world of micro sumo robots.',
  'The XS1 Micro Sumo Robot Kit is a great way to begin in the world of micro sumo robots.

It will challenge you to think up new and creative ways to win your opponents. With 4 sensors (3 Opponent Sensor, 1 Line Sensor) and 2 gear motors built-in, we''ve made it easy for you to work and build your own robot and go head-to-head with opponents.

You can even program your robots with the XMotion Micro Controller based on Arduino software. (Arduino Leonardo bootloaded mcu)

The XS1 is under 100 grams and under 5 cm in length, height and width (fits to all official micro sumo robot rules).

Each body part is specially designed for basic assembly and fast fixing if needed between robot matches.

## **Technical Features of Micro Sumo Robot Kit**
49mm width, 49.5mm length, 47mm height.
94 grams weight

You''ll receive a complete micro sumo robot kit ready for battle. The XS1 is the first in a series of made-for-fun micro sumo robots. It''s designed to be small & portable so you can take it with you.

What''s more, the XS1 is completely customizable. Paint with your own style. Attach extra modules like bluetooth or robot start module.

# Hardware
### **XMotion Micro Robot Controller Board**
Micro-sized controller (ATmega32u4, dual 1A driver), 7–15V, Arduino IDE via micro USB. 2 user buttons, 2 user LEDs.

### **JS40F Infrared Opponent Sensors**
3× JS40F digital IR sensors (up to 60cm), placed front/left/right for wide coverage.

### **ML1 Line, Edge Sensor**
Analog sensor for dohyo edge detection.

### **DC Micro Gear Motors**
Strong 6V gear motors (overvoltage up to 12V).

### **Body Parts**
3 precision plastic parts; serviceable with four M2 screws.

### **Blade**
10mm width, 0.3mm thickness double-sharpened; 20° support angle.

### **Super Grip & Light Silicone Wheels**
High-traction silicone; recommended IPA cleaning between matches.

## **Software**
Well-commented Arduino code provided. Beginner-friendly and tournament-ready; extend as needed.
[Blog code walkthrough](https://blog.jsumo.com/xs1-micro-sumo-arduino-code-explanation-of-the-robot-code/)',
  '## **Dimensions & Weight**
- **Size(cm):** 5 x 5 x 5
- **Height(cm):** 5
- **Weight(Kg):** 0.1',
  124.90,
  100,
  TRUE
);

SET @item_slug_name = 'xs1-micro-sumo-robot-kit';
SET @item_id = (SELECT id FROM item WHERE slug=@item_slug_name COLLATE utf8mb4_unicode_ci LIMIT 1);

INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES
  (@item_id, @item_slug_name, '/uploads/items/XS1_Micro_Sumo_Robot_Kit_1-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/XS1_Micro_Sumo_Robot_Kit_2-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/XS1_Micro_Sumo_Robot_Kit_3-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/XS1_Micro_Sumo_Robot_Kit_4-Photoroom.jpg'),
  (@item_id, @item_slug_name, '/uploads/items/XS1_Micro_Sumo_Robot_Kit_5-Photoroom.jpg');

COMMIT;
