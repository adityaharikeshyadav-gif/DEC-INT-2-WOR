MOCK_PEOPLE = [
    {
        "id": "p1",
        "name": "Sarah Chen",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "compatibility": "98% Match",
        "profession": "AI Research Scientist",
        "interests": ["Generative Art", "Hiking", "Sci-Fi"],
        "bio": "Building future minds by day, exploring local trails and sketching by night. Love deep chats about technology and consciousness."
    },
    {
        "id": "p2",
        "name": "Marcus Vance",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "compatibility": "94% Match",
        "profession": "Architect & Designer",
        "interests": ["Minimalism", "Jazz", "Urban Sketching"],
        "bio": "Fascinated by how spaces shape human behavior. Always hunting for the perfect espresso and mid-century vinyl records."
    },
    {
        "id": "p3",
        "name": "Elena Rostova",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "compatibility": "91% Match",
        "profession": "Art Curator",
        "interests": ["Contemporary Art", "Indie Films", "Wine Tasting"],
        "bio": "Curating experiences that challenge perspectives. Passionate about indie cinema, natural wines, and local gallery openings."
    },
    {
        "id": "p4",
        "name": "Devon Kincaid",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        "compatibility": "89% Match",
        "profession": "Growth Product Manager",
        "interests": ["Surfing", "Baking", "Podcasts"],
        "bio": "Product builder, amateur sourdough baker, and weekend surfer. Always curious about startup ideas and psychology."
    },
    {
        "id": "p5",
        "name": "Aisha Rahman",
        "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        "compatibility": "95% Match",
        "profession": "Creative Director",
        "interests": ["Typography", "Street Photography", "Vinyl"],
        "bio": "Visual storyteller obsessed with design details. Love roaming cities with an old Leica film camera and discovering local jazz bars."
    }
]

EXPERIENCES_CATALOG = [
    {
        "id": "rooftop-social-sf",
        "title": "Sunset Rooftop Social",
        "tagline": "High-altitude conversations and curated cocktails.",
        "description": "An evening of elevated connection above the city lights. Sip signature craft cocktails, enjoy artisanal pairings, and meet a handpicked group of local creators, builders, and designers under the warm glow of the golden hour. Includes two custom cocktails and chef-curated small bites.",
        "heroImage": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600",
            "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600",
            "https://images.unsplash.com/photo-1574096079513-d8259312b785?w=600"
        ],
        "city": "San Francisco",
        "venue": "Charmaine's Rooftop Lounge",
        "coordinates": {"lat": 37.7786, "lng": -122.4137},
        "date": "2026-07-02",
        "time": "6:30 PM - 9:30 PM",
        "duration": "3 hours",
        "price": 95,
        "ticketTypes": [
            {"name": "Solo Explorer", "price": 95, "description": "Single entry, includes 2 signature cocktails and gourmet bites."},
            {"name": "Bring a Friend", "price": 160, "description": "Dual entry (Save $30), includes 4 signature cocktails and shared bites."}
        ],
        "capacity": 25,
        "filled": 21,
        "status": "almost-full",
        "category": "social",
        "tags": ["Networking", "Cocktails", "Views", "Designers"],
        "recommendedPeople": [MOCK_PEOPLE[0], MOCK_PEOPLE[1], MOCK_PEOPLE[4]],
        "host": {
            "name": "Julian Vance",
            "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            "role": "Elinity City Host",
            "bio": "Lover of skyline views, architectural history, and craft mixology. Excited to introduce you to SF's finest creators."
        },
        "rating": 4.9,
        "reviews": [
            {"name": "Chloe T.", "avatar": "CT", "rating": 5.0, "text": "Met two people who are now close friends. The crowd curation is unmatched!", "date": "June 2026"},
            {"name": "Ryan M.", "avatar": "RM", "rating": 5.0, "text": "Breathtaking views and phenomenal cocktails. Definitely coming to the next one.", "date": "May 2026"}
        ],
        "included": ["2 Craft Cocktails / Mocktails", "Curated Gourmet Small Plates", "Skylight Lounge Access", "Curated Intros"],
        "requirements": ["Age 21+", "Smart Casual Attire"],
        "shareLink": "https://elinity.com/experiences/rooftop-social-sf",
        "isRecommended": True
    },
    {
        "id": "natural-wine-tasting",
        "title": "Natural Wine & Vinyl Lounge",
        "tagline": "Unfiltered wines, raw beats, and authentic chats.",
        "description": "A sensory journey through the world of low-intervention biodynamic wines. Guided by a certified sommelier, we will taste five unique natural wines paired with artisan cheeses and charcuterie, all while spinning an eclectic selection of jazz, soul, and ambient vinyl records.",
        "heroImage": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1474722883778-792e79586859?w=600",
            "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600",
            "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600"
        ],
        "city": "San Francisco",
        "venue": "DecantSF Wine Bar",
        "coordinates": {"lat": 37.7758, "lng": -122.4098},
        "date": "2026-07-04",
        "time": "7:00 PM - 9:30 PM",
        "duration": "2.5 hours",
        "price": 80,
        "ticketTypes": [
            {"name": "Solo Sommelier", "price": 80, "description": "Single entry, includes 5 wine tastings and cheese pairings."},
            {"name": "Double Pour", "price": 145, "description": "Dual entry, includes full flights for two and shared board."}
        ],
        "capacity": 16,
        "filled": 6,
        "status": "confirmed",
        "category": "food",
        "tags": ["Wine", "Vinyl", "Tasting", "Intimate"],
        "recommendedPeople": [MOCK_PEOPLE[2], MOCK_PEOPLE[4]],
        "host": {
            "name": "Elise Dupont",
            "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
            "role": "Sommelier & Host",
            "bio": "French-born natural wine advocate. I believe wine should tell a story of the soil, the grape, and the hands that made it."
        },
        "rating": 4.8,
        "reviews": [
            {"name": "Liam P.", "avatar": "LP", "rating": 5.0, "text": "Incredibly educational and laid-back. The orange wine was mind-blowing!", "date": "June 2026"}
        ],
        "included": ["Flight of 5 Biodynamic Wines", "Artisan Cheese & Charcuterie Board", "Sommelier Guide Book", "Lumi Vinyl Playlist Access"],
        "requirements": ["Age 21+"],
        "shareLink": "https://elinity.com/experiences/natural-wine-tasting",
        "isRecommended": True
    },
    {
        "id": "pottery-workshop-clay",
        "title": "Clay, Craft & Cabernet",
        "tagline": "Get your hands dirty. Express your inner artist.",
        "description": "An intimate, hands-on pottery workshop designed for beginners. Under the guidance of master ceramicist Kenji, you will learn the art of wheel throwing and hand-building. Enjoy a glass of fine Cabernet Sauvignon as you shape your own custom mug or bowl, which will be glazed and fired for you.",
        "heroImage": "https://images.unsplash.com/photo-1565192647048-f997ded87958?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600",
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600"
        ],
        "city": "Oakland",
        "venue": "Muddy Waters Clay Studio",
        "coordinates": {"lat": 37.8044, "lng": -122.2711},
        "date": "2026-07-05",
        "time": "2:00 PM - 5:00 PM",
        "duration": "3 hours",
        "price": 110,
        "ticketTypes": [
            {"name": "Single Clay Ticket", "price": 110, "description": "All materials, wheel time, 1 glass of wine, firing of 2 pieces."},
            {"name": "Clay for Two", "price": 200, "description": "Save $20. Dual entry, all materials, wine, firing for both."}
        ],
        "capacity": 12,
        "filled": 11,
        "status": "few-spots-left",
        "category": "creative",
        "tags": ["Pottery", "Art", "Wine", "Hands-on"],
        "recommendedPeople": [MOCK_PEOPLE[1], MOCK_PEOPLE[2]],
        "host": {
            "name": "Kenji Sato",
            "avatar": "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150",
            "role": "Master Ceramicist",
            "bio": "Over 15 years of clay throwing. I believe pottery is a form of active meditation and grounding."
        },
        "rating": 5.0,
        "reviews": [
            {"name": "Mia K.", "avatar": "MK", "rating": 5.0, "text": "Kenji is a patient and wonderful teacher. Super proud of the bowl I made!", "date": "June 2026"}
        ],
        "included": ["Premium Stoneware Clay", "Use of Pottery Wheel & Tools", "Glazing & Kiln Firing Services", "1 Glass of Premium Wine"],
        "requirements": ["Wear clothes you don't mind getting dusty", "Short nails recommended"],
        "shareLink": "https://elinity.com/experiences/pottery-workshop-clay",
        "isRecommended": False
    },
    {
        "id": "sunrise-coastal-hike",
        "title": "Sunrise Coastal Meditation & Hike",
        "tagline": "Watch the ocean wake up. Find your center.",
        "description": "A refreshing early morning experience along the rugged cliffs of Lands End. We will start with a silent 15-minute mindfulness meditation as the sun crests the horizon, followed by a scenic 3.5-mile hike with panoramic Golden Gate views. Finishing with hot artisanal tea and pastries at a hidden beach.",
        "heroImage": "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
            "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600"
        ],
        "city": "San Francisco",
        "venue": "Lands End Lookout",
        "coordinates": {"lat": 37.7802, "lng": -122.5117},
        "date": "2026-07-11",
        "time": "5:45 AM - 8:45 AM",
        "duration": "3 hours",
        "price": 45,
        "ticketTypes": [
            {"name": "Solo Hiker", "price": 45, "description": "Guided hike, meditation session, hot tea, and fresh pastry."},
            {"name": "Hike Buddies", "price": 80, "description": "Dual entry, guided hike, tea, and pastries for two."}
        ],
        "capacity": 20,
        "filled": 8,
        "status": "filling-fast",
        "category": "active",
        "tags": ["Hiking", "Meditation", "Nature", "Wellness"],
        "recommendedPeople": [MOCK_PEOPLE[0], MOCK_PEOPLE[3]],
        "host": {
            "name": "Dahlia Reyes",
            "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
            "role": "Mindfulness Coach",
            "bio": "Avid trail runner and meditation teacher. Connecting people back to nature, one step at a time."
        },
        "rating": 4.7,
        "reviews": [
            {"name": "Ethan W.", "avatar": "EW", "rating": 4.0, "text": "Getting up at 5 AM was tough, but the view of the Golden Gate wrapped in fog was magical.", "date": "May 2026"}
        ],
        "included": ["Guided Mindfulness Meditation", "Guided 3.5-Mile Coastal Hike", "Hot Organic Herbal Tea", "Fresh Local Croissants"],
        "requirements": ["Comfortable hiking shoes", "Layered clothing for SF morning chill"],
        "shareLink": "https://elinity.com/experiences/sunrise-coastal-hike",
        "isRecommended": False
    },
    {
        "id": "jazz-loft-evening",
        "title": "Secret Loft Jazz & Old Fashioneds",
        "tagline": "Intimate live jazz in a private industrial loft.",
        "description": "Step into a hidden SoMa loft for an exclusive, candlelit performance by the Marcus Shelby Quartet. Surrounded by art and exposed brick, enjoy a masterclass in crafting the perfect Old Fashioned before sitting back to experience raw, unplugged acoustic jazz up close.",
        "heroImage": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1486591978090-58e619d37fe7?w=600",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600"
        ],
        "city": "San Francisco",
        "venue": "Soma Arts Loft",
        "coordinates": {"lat": 37.7785, "lng": -122.4056},
        "date": "2026-07-12",
        "time": "8:00 PM - 11:00 PM",
        "duration": "3 hours",
        "price": 90,
        "ticketTypes": [
            {"name": "Jazz Enthusiast", "price": 90, "description": "Includes loft entry, live performance, and 2 premium Old Fashioneds."},
            {"name": "VIP Booth (Shared)", "price": 160, "description": "Front-row couch seating for two, premium cocktails."}
        ],
        "capacity": 30,
        "filled": 30,
        "status": "sold-out",
        "category": "music",
        "tags": ["Live Music", "Jazz", "Cocktails", "Speakeasy"],
        "recommendedPeople": [MOCK_PEOPLE[1], MOCK_PEOPLE[4], MOCK_PEOPLE[2]],
        "host": {
            "name": "Marcus Shelby",
            "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
            "role": "Composer & Musician",
            "bio": "Bassist and composer dedicated to sharing the rich history of American jazz through intimate, acoustic storytelling."
        },
        "rating": 4.9,
        "reviews": [
            {"name": "Oliver D.", "avatar": "OD", "rating": 5.0, "text": "Absolute highlight of my month. The sound in the loft was incredible!", "date": "June 2026"}
        ],
        "included": ["Live 2-set Jazz Performance", "Cocktail Masterclass", "2 Premium Craft Cocktails", "Artisanal Charcuterie Bites"],
        "requirements": ["Age 21+", "No flash photography during performance"],
        "shareLink": "https://elinity.com/experiences/jazz-loft-evening",
        "isRecommended": True
    },
    {
        "id": "pasta-making-masterclass",
        "title": "Handmade Pasta & Prosecco",
        "tagline": "Roll, shape, and feast like a true Italian.",
        "description": "Learn the ancient art of making fresh pasta from scratch. Chef Giovanni will teach you how to knead the perfect semolina dough, roll it using brass cutters, and shape classic forms like Tagliatelle and Garganelli. Top it off with a leisurely sit-down dinner of your creations paired with organic Italian wines.",
        "heroImage": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600",
            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600"
        ],
        "city": "San Francisco",
        "venue": "La Scuola Culinaria",
        "coordinates": {"lat": 37.7984, "lng": -122.4085},
        "date": "2026-07-15",
        "time": "6:30 PM - 9:30 PM",
        "duration": "3 hours",
        "price": 115,
        "ticketTypes": [
            {"name": "Solo Chef", "price": 115, "description": "Hands-on class, full dinner feast, and unlimited Prosecco."},
            {"name": "Chef Duo", "price": 210, "description": "Save $20. Cooking station for two, dinner, and wine."}
        ],
        "capacity": 14,
        "filled": 12,
        "status": "almost-full",
        "category": "food",
        "tags": ["Cooking", "Italian", "Pasta", "Wine"],
        "recommendedPeople": [MOCK_PEOPLE[2], MOCK_PEOPLE[3]],
        "host": {
            "name": "Giovanni Rossi",
            "avatar": "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150",
            "role": "Master Pasta Chef",
            "bio": "Born in Bologna, raised in kitchens. I believe pasta is not just food, it is a love language passed down through generations."
        },
        "rating": 4.95,
        "reviews": [
            {"name": "Lucas S.", "avatar": "LS", "rating": 5.0, "text": "Unbelievable experience! Giovanni makes you feel like family.", "date": "June 2026"}
        ],
        "included": ["Hands-on Cooking Instruction", "All Ingredients & Equipment", "Three-Course Sit-down Dinner", "Free-flowing Prosecco & Chianti"],
        "requirements": ["Please notify us of any gluten allergies beforehand"],
        "shareLink": "https://elinity.com/experiences/pasta-making-masterclass",
        "isRecommended": True
    },
    {
        "id": "street-photography-walk",
        "title": "Neon & Shadow Photography Walk",
        "tagline": "Capture the cinematic essence of SF after dark.",
        "description": "Explore the neon-lit alleys and dramatic shadows of Chinatown and North Beach through your lens. Lead by professional street photographer Aisha, we will master low-light composition, long exposures, and capturing candid human moments. Open to both DSLR and smartphone photographers.",
        "heroImage": "https://images.unsplash.com/photo-1504701954957-2390f806e9f4?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600",
            "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600"
        ],
        "city": "San Francisco",
        "venue": "Dragon's Gate (Chinatown)",
        "coordinates": {"lat": 37.7907, "lng": -122.4056},
        "date": "2026-07-18",
        "time": "8:30 PM - 11:00 PM",
        "duration": "2.5 hours",
        "price": 60,
        "ticketTypes": [
            {"name": "Solo Shutterbug", "price": 60, "description": "Guided walk, composition review, and editing tips sheet."},
            {"name": "Creative Partners", "price": 110, "description": "Dual entry, guided walk and feedback for two."}
        ],
        "capacity": 10,
        "filled": 9,
        "status": "almost-full",
        "category": "creative",
        "tags": ["Photography", "Chinatown", "Art", "Walking"],
        "recommendedPeople": [MOCK_PEOPLE[4], MOCK_PEOPLE[0]],
        "host": {
            "name": "Aisha Rahman",
            "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
            "role": "Street Photographer",
            "bio": "Visual artist capturing urban landscapes and fleeting human interactions. Published in Leica Magazine."
        },
        "rating": 4.85,
        "reviews": [
            {"name": "Sophia R.", "avatar": "SR", "rating": 5.0, "text": "Learned more about composition in 2 hours than in 2 years of YouTube tutorials.", "date": "May 2026"}
        ],
        "included": ["Professional Photography Mentorship", "Curated Chinatown/North Beach Route", "Group Image Critique Session", "PDF Editing Guidebook"],
        "requirements": ["Any camera (smartphone, mirrorless, or film)", "Comfortable walking shoes"],
        "shareLink": "https://elinity.com/experiences/street-photography-walk",
        "isRecommended": False
    },
    {
        "id": "meditation-tea-ceremony",
        "title": "Zen Sound Bath & Gong Fu Tea",
        "tagline": "Quiet the mind. Awaken the senses.",
        "description": "A deeply restorative afternoon designed to reset your nervous system. Sink into a sound bath of crystal singing bowls and planetary gongs, followed by a traditional Gong Fu Cha tea ceremony. We will taste rare, aged Pu-erh and high-mountain Oolong teas in mindful silence, followed by sharing.",
        "heroImage": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600",
            "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600"
        ],
        "city": "Berkeley",
        "venue": "The Zen Sanctuary",
        "coordinates": {"lat": 37.8715, "lng": -122.273},
        "date": "2026-07-19",
        "time": "3:00 PM - 5:30 PM",
        "duration": "2.5 hours",
        "price": 70,
        "ticketTypes": [
            {"name": "Solo Zen", "price": 70, "description": "Includes sound bath setup, tea ceremony, and organic light snacks."},
            {"name": "Zen for Two", "price": 130, "description": "Dual entry, full sound bath setup, and tea flights."}
        ],
        "capacity": 15,
        "filled": 5,
        "status": "confirmed",
        "category": "active",
        "tags": ["Meditation", "Sound Bath", "Tea Ceremony", "Wellness"],
        "recommendedPeople": [MOCK_PEOPLE[0], MOCK_PEOPLE[3]],
        "host": {
            "name": "Master Tenzin",
            "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
            "role": "Meditation Master",
            "bio": "Spent 6 years studying in Tibetan monasteries. Dedicated to bringing ancient mindfulness practices into modern lives."
        },
        "rating": 5.0,
        "reviews": [
            {"name": "Zara V.", "avatar": "ZV", "rating": 5.0, "text": "The sound bath vibrated through my entire body. Truly therapeutic.", "date": "June 2026"}
        ],
        "included": ["60-Minute Crystal Bowl Sound Bath", "Traditional Gong Fu Cha Tea Service", "Premium Organic Tea Flight", "Meditation Cushion & Blanket Rental"],
        "requirements": ["Loose, comfortable clothing", "Please arrive 10 minutes early"],
        "shareLink": "https://elinity.com/experiences/meditation-tea-ceremony",
        "isRecommended": True
    },
    {
        "id": "deckoviz-archival-atelier",
        "title": "Deckoviz Archival Atelier & Linotype Workshop",
        "tagline": "Subconscious cinematic bias, tactile printmaking, and chiaroscuro.",
        "description": "Step inside the Deckoviz Archival Atelier for an exclusive workshop exploring Victorian woodcut crosshatching, 19th-century amber celluloid grain, and digital linotype composition. Learn to translate subconscious aesthetic instincts into physical relief prints and digital folios.",
        "heroImage": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600",
            "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600"
        ],
        "city": "San Francisco",
        "venue": "Deckoviz Archival Atelier",
        "coordinates": {"lat": 37.7749, "lng": -122.4194},
        "date": "2026-08-05",
        "time": "6:00 PM - 8:30 PM",
        "duration": "2.5 hours",
        "price": 85,
        "ticketTypes": [
            {"name": "Atelier Pass", "price": 85, "description": "Includes woodcut carving tools, archival cotton rag paper, and ink supplies."},
            {"name": "Patron & Folio", "price": 140, "description": "Includes framed archival print and bespoke digital folio export."}
        ],
        "capacity": 12,
        "filled": 4,
        "status": "confirmed",
        "category": "creative",
        "tags": ["Printmaking", "Linotype", "Generative Art", "Aesthetic Calibration"],
        "recommendedPeople": [MOCK_PEOPLE[2], MOCK_PEOPLE[4]],
        "host": {
            "name": "Vizzy & Master Printmaker Julian",
            "avatar": "/logo.jpeg",
            "role": "Chief Atelier Curator",
            "bio": "Specializes in 19th-century woodcuts and modern algorithmic typography. Dedicated to tactile materiality."
        },
        "rating": 5.0,
        "reviews": [
            {"name": "Kiran S.", "avatar": "KS", "rating": 5.0, "text": "The tactile texture of the rag paper combined with linotype weights was breathtaking.", "date": "July 2026"}
        ],
        "included": ["Hand-carved Linotype Plate", "Archival Cotton Print", "Artisan Coffee & Aperitivo", "Digital Vector Calibration"],
        "requirements": ["Aprons provided; wear comfortable creative studio attire"],
        "shareLink": "https://deckoviz.com/experiences/archival-atelier",
        "isRecommended": True
    },
    {
        "id": "deckoviz-illuminated-story-studio",
        "title": "Illuminated Story Studio & Manuscript Forge",
        "tagline": "From poetic prompt to celluloid story sequence.",
        "description": "An intimate evening masterclass in sequential narrative direction, cinematic framing, and aesthetic divination. Craft multi-panel animatics with warm atmospheric chiaroscuro and master linotype weights under the guidance of resident curators.",
        "heroImage": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600"
        ],
        "city": "San Francisco",
        "venue": "Deckoviz Story Studio",
        "coordinates": {"lat": 37.7833, "lng": -122.4167},
        "date": "2026-08-12",
        "time": "7:00 PM - 9:30 PM",
        "duration": "2.5 hours",
        "price": 95,
        "ticketTypes": [
            {"name": "Director Pass", "price": 95, "description": "Full access to animatic workstations and story consoles."},
            {"name": "Studio Duo", "price": 170, "description": "Dual workstation setup with collaborative narrative script binding."}
        ],
        "capacity": 10,
        "filled": 3,
        "status": "confirmed",
        "category": "creative",
        "tags": ["Cinematic Storyboards", "Visual Storytelling", "Manuscripts", "Art Direction"],
        "recommendedPeople": [MOCK_PEOPLE[0], MOCK_PEOPLE[2]],
        "host": {
            "name": "Elena Rostova",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "role": "Narrative Director",
            "bio": "Curates visual narrative spaces and cinematic storytelling workflows for discerning creators."
        },
        "rating": 4.9,
        "reviews": [
            {"name": "Liam T.", "avatar": "LT", "rating": 5.0, "text": "Transformed a raw idea into an illuminated storyboard sequence in two hours.", "date": "July 2026"}
        ],
        "included": ["Digital Manuscript Binding", "Celluloid Grain Calibration", "Studio Reserve Wines", "Storyboard Print Folio"],
        "requirements": ["Bring your story concept or let the dialectic engine spark one for you"],
        "shareLink": "https://deckoviz.com/experiences/story-studio",
        "isRecommended": True
    },
    {
        "id": "deckoviz-curated-art-salon",
        "title": "Curated Art Folio & Aesthetic Calibration Salon",
        "tagline": "Discover your signature art movement with live curator analysis.",
        "description": "An evening salon pairing organic natural wines with interactive style divination. Compare high-contrast Victorian woodcuts with luminous impressionist palettes and receive your personalized aesthetic dossier and custom color swatch portfolio.",
        "heroImage": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600",
            "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600"
        ],
        "city": "Berkeley",
        "venue": "Deckoviz Gallery & Salon",
        "coordinates": {"lat": 37.8715, "lng": -122.2730},
        "date": "2026-08-18",
        "time": "6:30 PM - 9:00 PM",
        "duration": "2.5 hours",
        "price": 65,
        "ticketTypes": [
            {"name": "Salon Admission", "price": 65, "description": "Includes wine tasting flights, style calibration, and personalized dossier."}
        ],
        "capacity": 16,
        "filled": 6,
        "status": "confirmed",
        "category": "social",
        "tags": ["Art Curation", "Wine Tasting", "Style Divination", "Impressionism"],
        "recommendedPeople": [MOCK_PEOPLE[1], MOCK_PEOPLE[4]],
        "host": {
            "name": "Marcus Vance",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "role": "Architect & Aesthetics Fellow",
            "bio": "Explores how light, architectural geometry, and curated aesthetics shape human connection."
        },
        "rating": 5.0,
        "reviews": [
            {"name": "Amara D.", "avatar": "AD", "rating": 5.0, "text": "A wonderful, unhurried salon. The taste calibration accurately pinpointed my palette.", "date": "July 2026"}
        ],
        "included": ["Natural Wine Flight", "Artisan Cheese & Charcuterie", "Personalized Aesthetic Dossier", "Color Palette Printout"],
        "requirements": ["21+ for wine tasting"],
        "shareLink": "https://deckoviz.com/experiences/art-salon",
        "isRecommended": True
    }
]

EXPERIENCES_BY_ID = {e["id"]: e for e in EXPERIENCES_CATALOG}

