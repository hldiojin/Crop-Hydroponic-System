import { Product } from "../types/types";

export const products: Product[] = [
  // Plants
  {
    id: 1,
    type: 'plant',
    name: "Smart Lettuce Kit",
    scientificName: "Lactuca sativa",
    price: 29.99,
    description: "IoT-enabled lettuce growing kit with automated monitoring",
    image: "https://perfectprime.com/cdn/shop/products/aspara-STEM-Hydroponic-Smart-Grower_786eeb08-a864-4977-b3b0-c885a7aad308.jpg?v=1662696594&width=1445",
    growthTime: "30-45 days",
    difficulty: "Easy",
    nutrientNeeds: ["Nitrogen", "Phosphorus", "Potassium"],
    phRange: "6.0-7.0"
  },
  {
    id: 2,
    type: 'plant',
    name: "Connected Basil System",
    scientificName: "Ocimum basilicum",
    price: 24.99,
    description: "Smart basil growing system with app control",
    image: "https://i.ytimg.com/vi/2S8aYbfzo9o/maxresdefault.jpg",
    growthTime: "20-30 days",
    difficulty: "Easy",
    nutrientNeeds: ["Nitrogen", "Magnesium"],
    phRange: "5.5-6.5"
  },
  {
    id: 3,
    type: 'plant',
    name: "Hydroponic Tomato Kit",
    scientificName: "Solanum lycopersicum",
    price: 39.99,
    description: "Complete hydroponic kit for growing tomatoes",
    image: "https://images-na.ssl-images-amazon.com/images/I/61rESDUhBCL._SL1001_.jpg",
    growthTime: "60-80 days",
    difficulty: "Medium",
    nutrientNeeds: ["Calcium", "Magnesium", "Potassium"],
    phRange: "5.5-6.5"
  },
  {
    id: 4,
    type: 'plant',
    name: "Smart Spinach System",
    scientificName: "Spinacia oleracea",
    price: 27.99,
    description: "IoT-enabled spinach growing system with automated care",
    image: "https://images.squarespace-cdn.com/content/v1/5e4d646fb8470a53cbeab41d/1582133780407-Z9QV1IP4NTKS2N8G9A8S/ke17ZwdGBToddI8pDm48kEnKRShXnlQM5s_9tcjbuiV7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0hReLB75oIvKxcDxwlnLXabmYybX2pgFpZHvTqBb4LcAid4b1NowKwW6d4GVwWP5Uw/image-asset.jpeg",
    growthTime: "30-40 days",
    difficulty: "Easy",
    nutrientNeeds: ["Nitrogen", "Phosphorus"],
    phRange: "6.0-7.0"
  },
  // Systems
  {
    id: 5,
    type: 'system',
    name: "SmartGrow Pro",
    price: 299.99,
    description: "Professional IoT hydroponic system with sensors",
    image: "https://th.bing.com/th/id/OIP.G4RpL9QmoYAsFvFZy9teLAAAAA?rs=1&pid=ImgDetMain",
    capacity: "12 plants",
    dimensions: "60x40x150 cm",
    features: ["pH monitoring", "EC sensing", "Mobile app", "Auto-dosing"],
    powerConsumption: "45W"
  },
  {
    id: 6,
    type: 'system',
    name: "HydroBox Mini",
    price: 149.99,
    description: "Compact smart hydroponic box for small spaces",
    image: "https://exindagroup.com/cdn/shop/products/hydrobox-311819.jpg?v=1698140223&width=600",
    capacity: "6 plants",
    dimensions: "40x30x100 cm",
    features: ["Water level sensor", "LED grow lights", "WiFi connection"],
    powerConsumption: "30W"
  },
  {
    id: 7,
    type: 'system',
    name: "AquaFarm",
    price: 199.99,
    description: "Advanced hydroponic system with fish integration",
    image: "https://img.freepik.com/premium-photo/watering-farm-plant-automatic-irrigation_756748-14514.jpg",
    capacity: "8 plants",
    dimensions: "50x35x120 cm",
    features: ["Fish tank", "Water recycling", "Nutrient monitoring"],
    powerConsumption: "40W"
  },
  {
    id: 8,
    type: 'system',
    name: "GreenHouse Pro",
    price: 349.99,
    description: "IoT-enabled greenhouse system for all-season growing",
    image: "https://static.vecteezy.com/system/resources/previews/007/383/409/non_2x/greenhouse-with-plants-and-trees-in-garden-spring-or-summer-banner-concept-or-background-illustration-vector.jpg",
    capacity: "20 plants",
    dimensions: "100x60x200 cm",
    features: ["Climate control", "Automated watering", "LED grow lights"],
    powerConsumption: "60W"
  },
  {
    id: 9,
    type: 'nutrient',
    name: "SmartNute Base",
    price: 19.99,
    description: "Smart-dosing compatible base nutrient solution",
    image: "https://bpl01-live-c3e607532880498b818c81580b02-33a6f85.divio-media.org/filer_public_thumbnails/filer_public/35/c3/35c33b38-9461-4c48-bd51-1bcbf76c6e72/rbu_std_base_white.png__800x600_subsampling-2_upscale.png",
    usage: "General purpose",
    concentration: "1000ppm",
    benefits: ["Complete nutrition", "pH balanced", "IoT compatible"],
    suitableFor: ["Leafy greens", "Herbs", "Vegetables"]
  },
  {
    id: 10,
    type: 'nutrient',
    name: "FruitBooster Plus",
    price: 24.99,
    description: "Smart nutrient enhancer for flowering plants",
    image: "https://th.bing.com/th/id/OIP.KVmuVNKk_4pTvGwBaMnn2QHaHa?w=166&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7",
    usage: "Flowering stage",
    concentration: "500ppm",
    benefits: ["Increased yield", "Better flavor", "Faster fruiting"],
    suitableFor: ["Tomatoes", "Peppers", "Strawberries"]
  },
  {
    id: 11,
    type: 'nutrient',
    name: "RootMax",
    price: 22.99,
    description: "Nutrient solution for strong root development",
    image: "https://th.bing.com/th/id/OIP.B1zAm1PwKAygTXD9ILW5ZAHaHa?rs=1&pid=ImgDetMain",
    usage: "Root development",
    concentration: "800ppm",
    benefits: ["Stronger roots", "Better nutrient uptake", "Healthier plants"],
    suitableFor: ["All plants"]
  },
  {
    id: 12,
    type: 'nutrient',
    name: "BloomBoost",
    price: 26.99,
    description: "Nutrient solution for enhanced blooming",
    image: "https://aptus.us/cdn/shop/files/Bloomboost_5L_US.png?v=1690251168",
    usage: "Blooming stage",
    concentration: "600ppm",
    benefits: ["More blooms", "Vibrant colors", "Longer blooming period"],
    suitableFor: ["Flowers", "Fruiting plants"]
  }
];