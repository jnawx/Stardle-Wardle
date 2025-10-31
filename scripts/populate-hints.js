import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');
const CACHE_DIR = path.join(__dirname, '..', 'fandom-cache');

console.log('💬 Populating quote hints and master hints from Fandom cache...\n');

// Load characters
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));

// Manual hints database - comprehensive quotes and descriptions
const hintsDatabase = {
  'luke-skywalker': {
    quote: "I am a Jedi, like my father before me.",
    master: "Farm boy from Tatooine who became the last Jedi Knight, destroyed the Death Star, and redeemed his father Darth Vader."
  },
  'leia-organa': {
    quote: "Help me, Obi-Wan Kenobi. You're my only hope.",
    master: "Princess and senator from Alderaan, leader of the Rebel Alliance, and twin sister to Luke Skywalker."
  },
  'darth-vader': {
    quote: "I am your father.",
    master: "Dark Lord of the Sith, former Jedi Anakin Skywalker, fell to the dark side and served the Emperor until his redemption."
  },
  'han-solo': {
    quote: "Never tell me the odds!",
    master: "Smuggler and captain of the Millennium Falcon who became a hero of the Rebellion and married Princess Leia."
  },
  'yoda': {
    quote: "Do or do not. There is no try.",
    master: "Ancient and wise Jedi Master who trained Jedi for 800 years, including Luke Skywalker and Count Dooku."
  },
  'obi-wan-kenobi': {
    quote: "Hello there!",
    master: "Jedi Master who trained Anakin Skywalker and later watched over Luke on Tatooine after Order 66."
  },
  'chewbacca': {
    quote: "*Wookiee roar*",
    master: "Loyal Wookiee co-pilot of the Millennium Falcon, best friend to Han Solo, and fierce warrior of the Rebellion."
  },
  'r2-d2': {
    quote: "*Beep boop beep*",
    master: "Brave astromech droid who served Padmé Amidala, Anakin Skywalker, and later Luke Skywalker through multiple conflicts."
  },
  'c-3po': {
    quote: "We're doomed!",
    master: "Protocol droid fluent in over six million forms of communication, built by Anakin Skywalker, constant companion to R2-D2."
  },
  'padme-amidala': {
    quote: "So this is how liberty dies... with thunderous applause.",
    master: "Queen and Senator of Naboo who secretly married Anakin Skywalker and gave birth to Luke and Leia before dying."
  },
  'rey': {
    quote: "I am all the Jedi.",
    master: "Scavenger from Jakku who discovered she was a powerful Force user and granddaughter of Emperor Palpatine, taking the Skywalker name."
  },
  'kylo-ren': {
    quote: "I will finish what you started.",
    master: "Son of Han Solo and Leia Organa who fell to the dark side, became Supreme Leader of the First Order, but was redeemed as Ben Solo."
  },
  'anakin-skywalker': {
    quote: "I don't like sand. It's coarse and rough and irritating, and it gets everywhere.",
    master: "Jedi Knight known as the Chosen One who fell to the dark side and became Darth Vader, father of Luke and Leia."
  },
  'mace-windu': {
    quote: "This party's over.",
    master: "Senior member of the Jedi Council with a unique purple lightsaber, master of Vaapad fighting form, killed by Palpatine."
  },
  'qui-gon-jinn': {
    quote: "Your focus determines your reality.",
    master: "Jedi Master who discovered Anakin Skywalker on Tatooine and was killed by Darth Maul, first to manifest as a Force ghost."
  },
  'darth-maul': {
    quote: "At last we will reveal ourselves to the Jedi. At last we will have revenge.",
    master: "Zabrak Sith Lord with double-bladed red lightsaber who killed Qui-Gon Jinn and survived being cut in half."
  },
  'count-dooku': {
    quote: "I have become more powerful than any Jedi.",
    master: "Former Jedi Master turned Sith Lord who led the Separatists as Count Dooku and Darth Tyranus until killed by Anakin."
  },
  'general-grievous': {
    quote: "You are a bold one!",
    master: "Cyborg general of the Separatist Droid Army who collected lightsabers from Jedi he killed, trained by Count Dooku."
  },
  'jango-fett': {
    quote: "I'm just a simple man trying to make my way in the universe.",
    master: "Mandalorian bounty hunter whose DNA was used to create the clone army, killed by Mace Windu on Geonosis."
  },
  'boba-fett': {
    quote: "He's no good to me dead.",
    master: "Clone of Jango Fett raised as his son, became the galaxy's most feared bounty hunter and later Daimyo of Tatooine."
  },
  'lando-calrissian': {
    quote: "Hello, what have we here?",
    master: "Smooth-talking gambler and administrator of Cloud City who betrayed and then helped Han Solo, became a general in the Rebellion."
  },
  'emperor-palpatine': {
    quote: "Execute Order 66.",
    master: "Dark Lord of the Sith who manipulated the Clone Wars to become Emperor, master to Vader, returned in a cloned body."
  },
  'sheev-palpatine': {
    quote: "I am the Senate!",
    master: "Senator from Naboo who secretly was Darth Sidious, orchestrated his rise to Emperor and the fall of the Jedi Order."
  },
  'ahsoka-tano': {
    quote: "I am no Jedi.",
    master: "Togruta Padawan of Anakin Skywalker who left the Jedi Order, survived Order 66, and became a key figure in the Rebellion."
  },
  'poe-dameron': {
    quote: "Somehow, Palpatine returned.",
    master: "Ace pilot and commander of the Resistance's starfighter corps, best friend to Finn, flew a black and orange X-wing."
  },
  'finn': {
    quote: "Rebel scum!",
    master: "Former First Order stormtrooper who defected to join the Resistance, developed Force sensitivity, close friend to Rey and Poe."
  },
  'captain-phasma': {
    quote: "You were always scum.",
    master: "Chrome-armored First Order captain and trainer of stormtroopers including Finn, fiercely loyal until her death."
  },
  'bb-8': {
    quote: "*Affirmative beeping*",
    master: "Orange and white spherical astromech droid belonging to Poe Dameron, carried a map to Luke Skywalker."
  },
  'grand-moff-tarkin': {
    quote: "You may fire when ready.",
    master: "Imperial Governor who commanded the Death Star and ordered the destruction of Alderaan, killed when the station exploded."
  },
  'mon-mothma': {
    quote: "Many Bothans died to bring us this information.",
    master: "Senator who became the first Chief of State of the New Republic, founding leader of the Rebel Alliance."
  },
  'wedge-antilles': {
    quote: "Look at the size of that thing!",
    master: "Ace Rebel pilot who survived both Death Star battles and fought at the Battle of Hoth, one of the best starfighter pilots."
  },
  'jar-jar-binks': {
    quote: "Meesa called Jar Jar Binks!",
    master: "Clumsy Gungan outcast who befriended the Jedi and later became a senator, accidentally helped Palpatine gain emergency powers."
  },
  'gial-ackbar': {
    quote: "It's a trap!",
    master: "Mon Calamari admiral who commanded the Rebel fleet at the Battle of Endor and later served the Resistance."
  },
  'cassian-andor': {
    quote: "Everything I did, I did for the Rebellion.",
    master: "Rebel intelligence officer and spy who helped steal the Death Star plans on Scarif, sacrificed himself for the cause."
  },
  'jyn-erso': {
    quote: "Rebellions are built on hope.",
    master: "Daughter of the Death Star's lead engineer who led the mission to steal the plans on Scarif, giving the Rebellion hope."
  },
  'din-djarin': {
    quote: "This is the Way.",
    master: "Mandalorian bounty hunter who rescued Grogu and became his protector, wielding the Darksaber and Dark Saber."
  },
  'din-grogu': {
    quote: "*Coos adorably*",
    master: "Young Force-sensitive member of Yoda's species who was rescued from the Jedi Temple and trained by Luke Skywalker."
  },
  'bo-katan-kryze': {
    quote: "I will not walk on their planets, I will not live under their rule.",
    master: "Mandalorian warrior and former leader of Death Watch who later fought to reclaim Mandalore from the Empire."
  },
  'cal-kestis': {
    quote: "Trust in the Force.",
    master: "Jedi Padawan who survived Order 66 and went into hiding as a scrapper before being hunted by the Inquisitors."
  },
  'cad-bane': {
    quote: "I'm your worst nightmare, pal.",
    master: "Ruthless Duros bounty hunter known for his wide-brimmed hat and breathing tubes, worked for the Separatists and crime syndicates."
  },
  'darth-bane': {
    quote: "One master, one apprentice. One to embody the power, the other to crave it.",
    master: "Ancient Sith Lord who created the Rule of Two after the Sith were nearly destroyed, ensuring their survival through secrecy."
  },
  'ben-solo': {
    quote: "I know what I have to do, but I don't know if I have the strength to do it.",
    master: "Son of Han and Leia who became Kylo Ren but was redeemed, giving his life to save Rey before becoming one with the Force."
  },
  'bossk': {
    quote: "I'll take every credit he's got!",
    master: "Trandoshan bounty hunter who hunted Wookiees and worked alongside Boba Fett, known for his reptilian appearance."
  },
  'ezra-bridger': {
    quote: "I know there's good in you.",
    master: "Street-smart Force-sensitive orphan from Lothal who joined the Ghost crew and later sacrificed himself with Thrall to save his people."
  },
  'rex': {
    quote: "I'm a soldier. I follow orders.",
    master: "Clone Captain of the 501st Legion who served under Anakin Skywalker, removed his inhibitor chip and helped the Rebellion."
  },
  'saw-gerrera': {
    quote: "Lies, deception!",
    master: "Partisan leader and extremist who fought against the Separatists and Empire, raised Jyn Erso after her father was taken."
  },
  'hondo-ohnaka': {
    quote: "I am a pirate! I don't even know what that means!",
    master: "Weequay pirate leader who ran operations from Florrum, often helped or hindered the Jedi for profit."
  },
  'asajj-ventress': {
    quote: "You would think Jedi would have such a sense of justice.",
    master: "Dathomirian Nightsister trained as a Sith assassin by Count Dooku before becoming a bounty hunter seeking redemption."
  },
  'sabine-wren': {
    quote: "I'm doing this my way.",
    master: "Mandalorian warrior, explosives expert, and artist who left the Imperial Academy, joined the Ghost crew, and wielded the Darksaber."
  },
  'hera-syndulla': {
    quote: "We have hope. Hope that things can get better.",
    master: "Twi'lek pilot and leader of the Ghost crew who fought against the Empire and became a general in the Rebellion."
  },
  'kanan-jarrus': {
    quote: "In the absence of the Jedi, we need people like you to stand up.",
    master: "Jedi survivor of Order 66 who hid as a smuggler before training Ezra Bridger, sacrificed himself to save his crew."
  },
  'grand-moff-tarkin': {
    quote: "You may fire when ready.",
    master: "Ruthless Imperial Governor who commanded the first Death Star and destroyed Alderaan to demonstrate the Empire's power."
  },
  'wilhuff-tarkin': {
    quote: "Fear will keep the local systems in line.",
    master: "Imperial Grand Moff who developed the Tarkin Doctrine of ruling through fear, commanded the Death Star's destruction of Alderaan."
  },
  'thrawn': {
    quote: "To defeat an enemy, you must know them.",
    master: "Blue-skinned Chiss Imperial Grand Admiral known for his brilliant tactical mind and study of art to understand his enemies."
  },
  'mitth\'raw\'nuruodo': {
    quote: "Art is the highest form of hope.",
    master: "Chiss officer exiled to the Unknown Regions who rose to become a Grand Admiral, studied cultures through their art."
  },
  '4-lom': {
    quote: "The capture of Solo should prove most profitable.",
    master: "Protocol droid reprogrammed as a bounty hunter, partnered with Zuckuss, hired by Vader to find the Millennium Falcon."
  },
  'stass-allie': {
    quote: "We will take a battalion of clones with us.",
    master: "Tholothian Jedi Master and Council member, cousin of Adi Gallia, killed during Order 66 on Saleucami."
  },
  'cassian-jeron-andor': {
    quote: "Everything I did, I did for the Rebellion.",
    master: "Rebel intelligence officer and spy who helped steal the Death Star plans on Scarif, sacrificed himself for the cause."
  },
  'ponda-baba': {
    quote: "*Angry grunts*",
    master: "Aqualish thug and smuggler who confronted Luke in the Mos Eisley Cantina, lost his arm to Obi-Wan's lightsaber."
  },
  'babu-frik': {
    quote: "Hey hey!",
    master: "Tiny Anzellan droidsmith on Kijimi who helped the Resistance by bypassing C-3PO's programming restrictions."
  },
  'bail-prestor-organa': {
    quote: "What if the democracy we thought we were serving no longer exists?",
    master: "Senator from Alderaan who adopted Leia, founding member of the Rebel Alliance, died when his planet was destroyed."
  },
  'cc-1004': {
    quote: "Commander Gree of the 41st Elite reporting for duty, sir.",
    master: "Clone Commander who specialized in exotic terrain, served under Yoda on Kashyyyk, killed by Yoda during Order 66."
  },
  'cc-1010': {
    quote: "Orders are orders.",
    master: "Clone Commander of the Coruscant Guard who wore distinctive red armor and hunted rogue Jedi after Order 66."
  },
  'cc-1119': {
    quote: "Good soldiers follow orders.",
    master: "Clone Commander who served under Pong Krell on Umbara, executed Jedi General Tiplar after Order 66."
  },
  'cc-1138': {
    quote: "Fire at will, commander.",
    master: "Clone Commander of the Galactic Marines known for his distinctive helmet, served under Ki-Adi-Mundi and executed Order 66."
  },
  'cc-2224': {
    quote: "The mission always comes first.",
    master: "Clone Marshal Commander who served under Obi-Wan Kenobi, wore distinctive orange armor, reluctantly executed Order 66."
  },
  'cc-2237': {
    quote: "Copy that.",
    master: "Clone pilot known as Oddball who led Clone Flight Squad Seven during the Clone Wars and Battle of Coruscant."
  },
  'cc-5869': {
    quote: "The safety of the senator is my top priority.",
    master: "Clone Commander known as Stone who guarded senators and served in the Coruscant Guard with distinctive red markings."
  },
  'cc-7567': {
    quote: "In my book, experience outranks everything.",
    master: "Clone Captain of the 501st Legion who served under Anakin Skywalker, removed his inhibitor chip and helped the Rebellion."
  },
  'riyo-chuchi': {
    quote: "I believe my people can be reasonable.",
    master: "Pantoran senator who advocated for clone rights, worked with Ahsoka Tano and helped clones after the Clone Wars ended."
  },
  'rush-clovis': {
    quote: "Sometimes the right path is not the easiest one.",
    master: "Separatist senator from Scipio who had a complicated history with Padmé Amidala and died defending the Banking Clan."
  },
  'salacious-b-crumb': {
    quote: "*Cackling laughter*",
    master: "Kowakian monkey-lizard who served as Jabba the Hutt's court jester, known for his distinctive cackling laugh."
  },
  'cc-6454': {
    quote: "We stand ready.",
    master: "Clone Commander Ponds who served under Mace Windu, wore maroon armor, died during an attack by bounty hunters."
  },
  'ct-27-5555': {
    quote: "No clone should have to go the way Tup did.",
    master: "Clone trooper known as Fives who discovered the inhibitor chips, tried to warn about Order 66 but was killed."
  },
  'ct-5385': {
    quote: "For the Republic!",
    master: "Clone trooper known as Tup whose malfunctioning inhibitor chip prematurely activated Order 66, leading to a conspiracy."
  },
  'ct-5597': {
    quote: "We're not programmed. We're soldiers.",
    master: "Clone trooper of the 501st Legion known as Jesse, wore Republic markings on his helmet, died during Order 66."
  },
  'ct-6116': {
    quote: "Patching you up is my specialty.",
    master: "Clone trooper medic known as Kix who discovered the inhibitor chip conspiracy but was captured before warning anyone."
  },
  'ct-6922': {
    quote: "I'm just trying to do my duty.",
    master: "Clone trooper known as Dogma who followed orders strictly, eventually executed his corrupt Jedi general Pong Krell."
  },
  'ct-00-2010': {
    quote: "This is our home. This is our fight.",
    master: "Clone trooper known as Droidbait who was killed defending Rishi Station from droid commandos early in the Clone Wars."
  },
  'ct-782': {
    quote: "Never leave a man behind.",
    master: "Clone trooper known as Hevy who sacrificed himself to destroy Rishi Station and alert the Republic to the Separatist attack."
  },
  'ct-9904': {
    quote: "Good soldiers follow orders.",
    master: "Clone sniper of Clone Force 99 known for his enhanced eyesight, turned against his squad after following Order 66."
  },
  'echo': {
    quote: "I don't like to guess. I like to be sure.",
    master: "Clone trooper thought dead at the Citadel, rescued and enhanced with cybernetics, joined Clone Force 99 (Bad Batch)."
  },
  'biggs-darklighter': {
    quote: "I've got him!",
    master: "Pilot from Tatooine and childhood friend of Luke Skywalker who joined the Rebellion, died in the Battle of Yavin."
  },
  'dengar': {
    quote: "I've been looking forward to this for a long time.",
    master: "Corellian bounty hunter hired by Vader to find Han Solo, wore distinctive armor and head wrappings to hide scars."
  },
  'jan-dodonna': {
    quote: "May the Force be with you.",
    master: "General who led the Rebel Alliance attack on the Death Star, planned the strategy that destroyed the battle station."
  },
  'dooku': {
    quote: "Twice the pride, double the fall.",
    master: "Count and Sith Lord who was once Yoda's apprentice, led the Separatists before being betrayed by Palpatine."
  },
  'embo': {
    quote: "I work alone.",
    master: "Kyuzo bounty hunter known for his wide-brimmed metal hat that doubled as a weapon and shield."
  },
  'galen-walton-erso': {
    quote: "We call it the Death Star.",
    master: "Brilliant scientist forced to design the Death Star's weapon, secretly sabotaged it with a fatal flaw."
  },
  'fennec-shand': {
    quote: "I'm a little old to be scared off by legends.",
    master: "Elite mercenary and assassin who was saved by Boba Fett, became his partner in ruling Tatooine's underworld."
  },
  'kit-fisto': {
    quote: "Hello, little one!",
    master: "Nautolan Jedi Master known for his perpetual smile and aquatic combat skills, killed by Palpatine in his office."
  },
  'bib-fortuna': {
    quote: "You will take me to Jabba now.",
    master: "Twi'lek majordomo who served Jabba the Hutt, briefly took over his palace before being killed by Boba Fett."
  },
  'adi-gallia': {
    quote: "The Jedi will not abandon our responsibilities.",
    master: "Tholothian Jedi Master and Council member known for her flying skills, killed by Savage Opress during the Clone Wars."
  },
  'greedo': {
    quote: "Koona t'chuta, Solo?",
    master: "Rodian bounty hunter who confronted Han Solo in the Mos Eisley Cantina, shot first in the Special Edition."
  },
  'gregar-typho': {
    quote: "I would certainly like to!",
    master: "Captain of Naboo's Royal Security Forces who protected Padmé Amidala, lost his left eye in service."
  },
  'nute-gunray': {
    quote: "I want that treaty signed!",
    master: "Neimoidian Trade Federation Viceroy who invaded Naboo at Palpatine's direction, led the Separatist Council."
  },
  'amilyn-holdo': {
    quote: "Hope is like the sun.",
    master: "Vice Admiral in the Resistance who sacrificed herself by ramming the Raddus into the First Order fleet at lightspeed."
  },
  'armitage-hux': {
    quote: "Today is the end of the Republic!",
    master: "First Order general who commanded Starkiller Base, secretly became a spy for the Resistance before being executed."
  },
  'ig-88b': {
    quote: "Affirmative.",
    master: "Assassin droid bounty hunter with a tall, skeletal frame, one of several IG-88 models, hired to find Han Solo."
  },
  'jek-tono-porkins': {
    quote: "I can hold it!",
    master: "Rebel pilot callsign Red Six who flew in the Battle of Yavin, tragically shot down before reaching the Death Star trench."
  },
  'k2-b4': {
    quote: "*Mechanical processing sounds*",
    master: "Super tactical droid who commanded Separatist forces on Onderon, destroyed by the Jedi during the Clone Wars."
  },
  'k-2so': {
    quote: "I'll be there for you. Cassian said I had to.",
    master: "Imperial security droid reprogrammed by the Rebellion, became Cassian Andor's sarcastic companion, died on Scarif."
  },
  'maz-kanata': {
    quote: "The Force, it's calling to you. Just let it in.",
    master: "Ancient Force-sensitive pirate who ran a castle on Takodana, gave Luke's lightsaber to Finn and Rey."
  },
  'ki-adi-mundi': {
    quote: "What about the droid attack on the Wookiees?",
    master: "Cerean Jedi Master with an enlarged cranium on the Jedi Council, killed during Order 66 on Mygeeto."
  },
  'plo-koon': {
    quote: "We are keepers of the peace, not soldiers.",
    master: "Kel Dor Jedi Master who wore an antiox mask, discovered Ahsoka Tano, crashed and died during Order 66."
  },
  'eeth-koth': {
    quote: "Death is just the beginning.",
    master: "Zabrak Jedi Master on the Council known for high pain tolerance, captured by Grievous but rescued by Obi-Wan."
  },
  'pong-krell': {
    quote: "It's treason, then.",
    master: "Besalisk Jedi General who turned to the dark side, used four lightsabers, executed by his own clones on Umbara."
  },
  'orson-callan-krennic': {
    quote: "Oh, it's beautiful.",
    master: "Imperial Director of Advanced Weapons Research who oversaw Death Star construction, killed when it fired on Scarif."
  },
  'satine-kryze': {
    quote: "The work of one madman is not the goal of the people.",
    master: "Duchess of Mandalore who advocated for pacifism, had a past romance with Obi-Wan, killed by Maul."
  },
  'cliegg-lars': {
    quote: "She's dead, son.",
    master: "Moisture farmer on Tatooine who freed and married Shmi Skywalker, lost his leg rescuing her from Tusken Raiders."
  },
  'shmi-skywalker-lars': {
    quote: "You can't stop the change, any more than you can stop the suns from setting.",
    master: "Anakin's mother who was a slave on Tatooine, freed and married Cliegg Lars, killed by Tusken Raiders."
  },
  'lobot': {
    quote: "*Cybernetic communication*",
    master: "Cyborg chief administrative aide to Lando Calrissian on Cloud City, enhanced with computer interface implants."
  },
  'jocasta-nu': {
    quote: "If an item does not appear in our records, it does not exist.",
    master: "Elderly Jedi librarian who guarded the Jedi Archives, killed by Vader while trying to protect ancient holocrons."
  },
  'barriss-offee': {
    quote: "The Jedi Order is failing.",
    master: "Mirialan Jedi Padawan who became disillusioned, framed Ahsoka Tano for terrorism before being captured."
  },
  'omega': {
    quote: "You're more than that. We all are.",
    master: "Young female clone with pure genetic replication, became the fifth member of Clone Force 99 (Bad Batch)."
  },
  'savage-opress': {
    quote: "I am not your apprentice!",
    master: "Zabrak Nightbrother transformed by Nightsister magic into Dooku's apprentice, brother to Darth Maul."
  },
  'owen-lars': {
    quote: "He has too much of his father in him.",
    master: "Moisture farmer who raised Luke Skywalker on Tatooine, son of Cliegg Lars, killed by stormtroopers."
  },
  'phasma': {
    quote: "Submit your blaster for inspection.",
    master: "Elite First Order stormtrooper captain in chrome armor, trained troops including Finn, fell to her death."
  },
  'darth-plagueis': {
    quote: "The dark side of the Force is a pathway to many abilities some consider to be unnatural.",
    master: "Muun Sith Lord who could manipulate midi-chlorians to create life, Palpatine's master who was killed in his sleep."
  },
  'poggle-the-lesser': {
    quote: "Our new battle droids are very effective.",
    master: "Geonosian Archduke who led the droid foundries that built the Separatist army, executed by Vader on Mustafar."
  },
  'unkar-plutt': {
    quote: "That droid's not for sale!",
    master: "Crolute junk dealer on Jakku who gave Rey meager food portions for scrap, tried to steal BB-8."
  },
  'yarael-poof': {
    quote: "We must investigate further.",
    master: "Quermian Jedi Master with elongated neck on the Council, master of mind tricks, died before the Clone Wars."
  },
  'r7-a7': {
    quote: "*Worried beeping*",
    master: "Green and white astromech droid who served Ahsoka Tano, helped the Martez sisters and Clone Underground."
  },
  'rc-1138': {
    quote: "Was it red-red-green or red-green-red?",
    master: "Clone commando known as Boss who led Delta Squad on special operations during the Clone Wars."
  },
  'rc-1140': {
    quote: "Form up on me.",
    master: "Clone commando known as Fixer, demolitions expert and technology specialist of Delta Squad."
  },
  'rc-1207': {
    quote: "Lock and load!",
    master: "Clone commando known as Sev, the aggressive sniper of Delta Squad who went missing on Kashyyyk."
  },
  'rc-1262': {
    quote: "You know what to do.",
    master: "Clone commando known as Scorch, the wise-cracking demolitions expert of Delta Squad."
  },
  'revan': {
    quote: "I am Revan reborn. And before me you are nothing.",
    master: "Legendary Jedi who fell to the dark side during the Mandalorian Wars, redeemed and saved the galaxy."
  },
  'max-rebo': {
    quote: "*Plays red ball jett organ*",
    master: "Ortolan musician and bandleader who performed in Jabba's palace and later Garsa's Sanctuary on Tatooine."
  },
  'rey-palpatine': {
    quote: "I am all the Jedi.",
    master: "Scavenger from Jakku who became a powerful Jedi, granddaughter of Palpatine who took the Skywalker name."
  },
  'roos-tarpals': {
    quote: "Wesa gonna die!",
    master: "Gungan military captain who fought in the Battle of Naboo, sacrificed himself fighting General Grievous."
  },
  'sabe': {
    quote: "I am Queen Amidala.",
    master: "Handmaiden and body double for Queen Amidala of Naboo, looked identical to Padmé and served as decoy."
  },
  'sebulba': {
    quote: "Choppa chawa!",
    master: "Dug podracer from Malastare known for cheating, lost the Boonta Eve Classic to young Anakin Skywalker."
  },
  'aayla-secura': {
    quote: "I sense a trap.",
    master: "Twi'lek Jedi Knight known for her athletic fighting style and blue lightsaber, killed during Order 66 on Felucia."
  },
  'bastila-shan': {
    quote: "The Force flows through all living things.",
    master: "Jedi Knight with rare battle meditation ability who redeemed Revan during the Old Republic era."
  },
  'sifo-dyas': {
    quote: "The Jedi will need an army.",
    master: "Jedi Master who secretly commissioned the clone army, killed by Count Dooku before the Clone Wars began."
  },
  'aurra-sing': {
    quote: "You should've paid me when you had the chance.",
    master: "Near-human bounty hunter with pale skin and an antenna implant, mentored Boba Fett after his father died."
  },
  'snoke': {
    quote: "Fulfill your destiny.",
    master: "Supreme Leader of the First Order who seduced Ben Solo to the dark side, secretly a creation of Palpatine."
  },
  'supreme-leader-snoke': {
    quote: "I cannot be betrayed. I cannot be beaten.",
    master: "Mysterious dark side user who led the First Order, scarred and deformed, killed by Kylo Ren who he trained."
  },
  'orn-free-taa': {
    quote: "I move for a vote of no confidence.",
    master: "Corpulent Twi'lek senator from Ryloth known for corruption, served in both Republic and Imperial senates."
  },
  'tarfful': {
    quote: "*Wookiee roar*",
    master: "Wookiee chieftain of Kachirho who fought alongside Yoda during the Battle of Kashyyyk against the Separatists."
  },
  'tc-14': {
    quote: "The ambassadors are Jedi Knights.",
    master: "Silver protocol droid owned by the Trade Federation who served drinks to Qui-Gon and Obi-Wan."
  },
  'rose-tico': {
    quote: "That's how we're gonna win. Not fighting what we hate. Saving what we love.",
    master: "Resistance maintenance worker who saved Finn's life, helped disable the First Order's hyperspace tracker."
  },
  'trace-martez': {
    quote: "We're not criminals!",
    master: "Human pilot and mechanic from Coruscant's underworld, sister to Rafa, befriended Ahsoka Tano."
  },
  'finis-valorum': {
    quote: "I will not defer. I have come before you to resolve this attack.",
    master: "Supreme Chancellor of the Republic who was outmaneuvered by Palpatine during the Naboo crisis."
  },
  'pre-vizsla': {
    quote: "Only the strongest shall rule!",
    master: "Mandalorian warrior who led Death Watch and wielded the Darksaber, killed by Maul in combat."
  },
  'quinlan-vos': {
    quote: "I always survive.",
    master: "Kiffar Jedi known for his unconventional methods and ability to read object memories, survived Order 66."
  },
  'wicket-wystri-warrick': {
    quote: "*Ewok chatter*",
    master: "Young Ewok scout who befriended Princess Leia and helped the Rebels defeat Imperial forces on Endor."
  },
  'watto': {
    quote: "Mind tricks don't work on me, only money!",
    master: "Toydarian junk dealer and slave owner on Tatooine who owned Anakin and Shmi before losing them."
  },
  'taun-we': {
    quote: "We modified their genetic structure to make them less independent.",
    master: "Kaminoan administrator who oversaw the clone army's creation, welcomed Obi-Wan to Kamino."
  },
  'zam-wesell': {
    quote: "We'll see about that!",
    master: "Clawdite shape-shifting assassin hired to kill Padmé, killed by Jango Fett before revealing her employer."
  },
  'yaddle': {
    quote: "Powerful, you have become, Dooku.",
    master: "Female member of Yoda's species on the Jedi Council, died confronting Count Dooku who absorbed her essence."
  },
  'zuckuss': {
    quote: "The Force is with me.",
    master: "Gand findsman bounty hunter who relied on mystical visions, partnered with 4-LOM to hunt Han Solo."
  },
  'rey': {
    quote: "I am all the Jedi.",
    master: "Scavenger from Jakku who discovered she was Force-sensitive, trained by Luke and Leia, defeated Palpatine."
  },
  'cc-3636': {
    quote: "We're loyal to each other, not some Empire.",
    master: "Clone Commander who served under Jedi Plo Koon, wore distinctive wolf-like markings, lost his eye in battle."
  },
  'ct-1409': {
    quote: "This is our home. This is our fight.",
    master: "Clone trooper thought dead at the Citadel, rescued and enhanced with cybernetics, joined Clone Force 99 (Bad Batch)."
  },
  'ct-411': {
    quote: "We live to serve the Jedi.",
    master: "Clone Commander who served under Mace Windu, wore distinctive maroon armor, killed by bounty hunters."
  },
  'ct-5555': {
    quote: "No clone should have to go the way Tup did.",
    master: "Clone trooper who discovered the inhibitor chips, tried to warn about Order 66 but was killed before revealing the truth."
  },
  'mitth-raw-nuruodo': {
    quote: "Art is the highest form of hope.",
    master: "Chiss officer exiled to the Unknown Regions who rose to become a Grand Admiral, studied cultures through their art."
  },
  'nien-nunb': {
    quote: "Nee jabba no badda.",
    master: "Sullustan smuggler and pilot who co-piloted the Millennium Falcon with Lando during the Battle of Endor."
  },
  'rey-skywalker': {
    quote: "I am all the Jedi.",
    master: "Scavenger from Jakku who became a powerful Jedi, Palpatine's granddaughter who rejected the dark side and took the Skywalker name."
  },
  'sab': {
    quote: "I am Queen Amidala.",
    master: "Handmaiden and body double for Queen Amidala of Naboo, looked identical to Padmé and frequently served as her decoy."
  },
  'lama-su': {
    quote: "You must be anxious to inspect the units for yourself.",
    master: "Kaminoan Prime Minister who oversaw the clone army production facility on Kamino, welcomed Obi-Wan Kenobi."
  },
  'wat-tambor': {
    quote: "The Techno Union army is at your disposal.",
    master: "Skakoan Foreman of the Techno Union who led the Separatist occupation of Ryloth, executed on Mustafar."
  },
  'ct-00-2010': {
    quote: "This is what I was bred for.",
    master: "Clone trooper known as Droidbait who was killed defending Rishi Station from droid commandos early in the Clone Wars."
  },
  'shaak-ti': {
    quote: "The clones are more than soldiers. They're men.",
    master: "Togruta Jedi Master on the Council who oversaw clone training on Kamino, died on multiple occasions depending on canon."
  }
};

let updated = 0;
let alreadyHad = 0;
let notFound = 0;

console.log('Processing characters...\n');

characters.forEach((char, index) => {
  const hints = hintsDatabase[char.id];
  
  if (hints) {
    // Only update if fields are currently null or empty
    const needsQuote = !char.quoteHint || char.quoteHint.trim() === '';
    const needsMaster = !char.masterHint || char.masterHint.trim() === '';
    
    if (needsQuote || needsMaster) {
      if (needsQuote) char.quoteHint = hints.quote;
      if (needsMaster) char.masterHint = hints.master;
      
      updated++;
      console.log(`✅ ${char.name}: Updated ${needsQuote && needsMaster ? 'both hints' : needsQuote ? 'quote' : 'master hint'}`);
    } else {
      alreadyHad++;
    }
  } else {
    notFound++;
    if (notFound <= 10) {
      console.log(`⚠️  ${char.name}: No hints in database (ID: ${char.id})`);
    }
  }
});

if (notFound > 10) {
  console.log(`⚠️  ... and ${notFound - 10} more characters without hints`);
}

// Save updated characters
fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2));

console.log('\n' + '='.repeat(60));
console.log('✅ Hint population complete!');
console.log('='.repeat(60));
console.log(`Total characters: ${characters.length}`);
console.log(`Updated with hints: ${updated}`);
console.log(`Already had hints: ${alreadyHad}`);
console.log(`Not found in database: ${notFound}`);
console.log('='.repeat(60));

console.log('\n✅ Characters updated and saved to:', CHARACTERS_FILE);

if (notFound > 0) {
  console.log('\n💡 Tip: You can add more hints to the database in this script and run it again.');
}
