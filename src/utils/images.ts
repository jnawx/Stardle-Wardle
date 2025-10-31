// Fallback placeholder images as data URIs
// These will work without any external API calls

export const placeholderImages: Record<string, string> = {
  'luke-skywalker': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3ELuke Skywalker%3C/text%3E%3C/svg%3E',
  'leia-organa': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3ELeia Organa%3C/text%3E%3C/svg%3E',
  'darth-vader': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EDarth Vader%3C/text%3E%3C/svg%3E',
  'han-solo': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EHan Solo%3C/text%3E%3C/svg%3E',
  'yoda': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EYoda%3C/text%3E%3C/svg%3E',
  'obi-wan-kenobi': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EObi-Wan Kenobi%3C/text%3E%3C/svg%3E',
  'chewbacca': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EChewbacca%3C/text%3E%3C/svg%3E',
  'r2-d2': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3ER2-D2%3C/text%3E%3C/svg%3E',
  'c-3po': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EC-3PO%3C/text%3E%3C/svg%3E',
  'padme-amidala': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EPadmé Amidala%3C/text%3E%3C/svg%3E',
  'rey': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3ERey%3C/text%3E%3C/svg%3E',
  'kylo-ren': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EKylo Ren%3C/text%3E%3C/svg%3E',
  'anakin-skywalker': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="20" fill="%23FFE81F" text-anchor="middle"%3EAnakin Skywalker%3C/text%3E%3C/svg%3E',
  'mace-windu': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EMace Windu%3C/text%3E%3C/svg%3E',
  'qui-gon-jinn': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EQui-Gon Jinn%3C/text%3E%3C/svg%3E',
  'darth-maul': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EDarth Maul%3C/text%3E%3C/svg%3E',
  'count-dooku': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3ECount Dooku%3C/text%3E%3C/svg%3E',
  'general-grievous': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="20" fill="%23FFE81F" text-anchor="middle"%3EGeneral Grievous%3C/text%3E%3C/svg%3E',
  'jango-fett': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EJango Fett%3C/text%3E%3C/svg%3E',
  'boba-fett': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EBoba Fett%3C/text%3E%3C/svg%3E',
  'lando-calrissian': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="20" fill="%23FFE81F" text-anchor="middle"%3ELando Calrissian%3C/text%3E%3C/svg%3E',
  'emperor-palpatine': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="18" fill="%23FFE81F" text-anchor="middle"%3EEmperor Palpatine%3C/text%3E%3C/svg%3E',
  'ahsoka-tano': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EAhsoka Tano%3C/text%3E%3C/svg%3E',
  'poe-dameron': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EPoe Dameron%3C/text%3E%3C/svg%3E',
  'finn': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EFinn%3C/text%3E%3C/svg%3E',
  'captain-phasma': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="20" fill="%23FFE81F" text-anchor="middle"%3ECaptain Phasma%3C/text%3E%3C/svg%3E',
  'bb-8': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EBB-8%3C/text%3E%3C/svg%3E',
  'grand-moff-tarkin': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="18" fill="%23FFE81F" text-anchor="middle"%3EGrand Moff Tarkin%3C/text%3E%3C/svg%3E',
  'mon-mothma': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EMon Mothma%3C/text%3E%3C/svg%3E',
  'wedge-antilles': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="20" fill="%23FFE81F" text-anchor="middle"%3EWedge Antilles%3C/text%3E%3C/svg%3E',
  'jar-jar-binks': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a1a" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="24" fill="%23FFE81F" text-anchor="middle"%3EJar Jar Binks%3C/text%3E%3C/svg%3E',
};

// Helper function to get character image
export function getCharacterImage(characterId: string): string {
  // Using Wookieepedia (Star Wars Wiki) images - more reliable than Disney CDN
  const swApiImages: Record<string, string> = {
    'luke-skywalker': 'https://static.wikia.nocookie.net/starwars/images/2/20/LukeTLJ.jpg',
    'leia-organa': 'https://static.wikia.nocookie.net/starwars/images/f/fc/Leia_Organa_TLJ.png',
    'darth-vader': 'https://static.wikia.nocookie.net/starwars/images/0/0c/Vader_ROTJcrop.jpg',
    'han-solo': 'https://static.wikia.nocookie.net/starwars/images/e/e2/TFAHanSolo.png',
    'yoda': 'https://static.wikia.nocookie.net/starwars/images/d/d6/Yoda_SWSB.png',
    'obi-wan-kenobi': 'https://static.wikia.nocookie.net/starwars/images/4/4e/ObiWanHS-SWE.jpg',
    'chewbacca': 'https://static.wikia.nocookie.net/starwars/images/4/48/Chewbacca_TLJ.png',
    'r2-d2': 'https://static.wikia.nocookie.net/starwars/images/e/eb/ArtooTFA2-Fathead.png',
    'c-3po': 'https://static.wikia.nocookie.net/starwars/images/3/3f/C-3PO_TLJ_Card_Trader_Award_Card.png',
    'padme-amidala': 'https://static.wikia.nocookie.net/starwars/images/b/b2/Padmegreenscrshot.jpg',
    'rey': 'https://static.wikia.nocookie.net/starwars/images/8/81/Rey_TROS.png',
    'kylo-ren': 'https://static.wikia.nocookie.net/starwars/images/1/1d/Kylo_Ren_TLJ_Collector%27s_Edition.png',
    'anakin-skywalker': 'https://static.wikia.nocookie.net/starwars/images/6/6f/Anakin_Skywalker_RotS.png',
    'mace-windu': 'https://static.wikia.nocookie.net/starwars/images/f/fc/Mace_Windu.jpg',
    'qui-gon-jinn': 'https://static.wikia.nocookie.net/starwars/images/f/f6/Qui-Gon_Jinn_Headshot_TPM.jpg',
    'darth-maul': 'https://static.wikia.nocookie.net/starwars/images/5/50/Darth_Maul_profile.png',
    'count-dooku': 'https://static.wikia.nocookie.net/starwars/images/b/b8/Dooku_Headshot.jpg',
    'general-grievous': 'https://static.wikia.nocookie.net/starwars/images/d/de/Grievoushead.jpg',
    'jango-fett': 'https://static.wikia.nocookie.net/starwars/images/5/56/JangoInfobox.png',
    'boba-fett': 'https://static.wikia.nocookie.net/starwars/images/e/eb/BobaFettMain.jpg',
    'lando-calrissian': 'https://static.wikia.nocookie.net/starwars/images/8/8f/Lando_ROTJ.png',
    'emperor-palpatine': 'https://static.wikia.nocookie.net/starwars/images/d/d8/Emperor_Sidious.png',
    'ahsoka-tano': 'https://static.wikia.nocookie.net/starwars/images/2/27/Ahsoka-Tano-AG-2023.png',
    'poe-dameron': 'https://static.wikia.nocookie.net/starwars/images/6/6b/PoeDameron-Heroes2023.png/revision/latest?cb=20231022210306',
    'finn': 'https://static.wikia.nocookie.net/starwars/images/a/af/Finn_TLJ_Collector%27s_Edition.png',
    'captain-phasma': 'https://static.wikia.nocookie.net/starwars/images/b/ba/Phasma-Fathead.png',
    'bb-8': 'https://static.wikia.nocookie.net/starwars/images/6/68/BB8-Fathead.png',
    'grand-moff-tarkin': 'https://static.wikia.nocookie.net/starwars/images/c/c1/Tarkininfobox.jpg',
    'mon-mothma': 'https://static.wikia.nocookie.net/starwars/images/b/b7/MP-MonMothma.png',
    'wedge-antilles': 'https://static.wikia.nocookie.net/starwars/images/6/60/WedgeHelmetless-ROTJHD.jpg',
    'jar-jar-binks': 'https://static.wikia.nocookie.net/starwars/images/d/d2/Jar_Jar_aotc.jpg',
  };

  // Return real image URL if available, otherwise placeholder
  return swApiImages[characterId] || placeholderImages[characterId] || '';
}
