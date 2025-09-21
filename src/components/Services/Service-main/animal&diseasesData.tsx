

// Predefined animal types
export const predefinedAnimalTypes = [
    { _id: 'dog', name: 'Dog', icon: '🐕' },
    { _id: 'cat', name: 'Cat', icon: '🐱' },
    { _id: 'horse', name: 'Horse', icon: '🐴' },
    { _id: 'pigs', name: 'Pigs', icon: '🐷' },
    { _id: 'birds', name: 'Birds', icon: '🐦' },
    { _id: 'cattle', name: 'Cattle', icon: '🐄' },
    { _id: 'poultry', name: 'Poultry', icon: '🐔' }
];


export const getDiseaseCategoriesForAnimal = (animalType: string) => {
    const diseaseMap: { [key: string]: Array<{ _id: string; name: string; description?: string }> } = {
        'dog': [
            { _id: 'skin-issues', name: 'Skin Issues', description: 'Dermatitis, allergies, infections' },
            { _id: 'digestive', name: 'Digestive Problems', description: 'Vomiting, diarrhea, appetite issues' },
            { _id: 'respiratory', name: 'Respiratory Issues', description: 'Coughing, breathing problems' },
            { _id: 'orthopedic', name: 'Orthopedic Issues', description: 'Joint problems, fractures' },
            { _id: 'dental', name: 'Dental Problems', description: 'Tooth decay, gum disease' },
            { _id: 'behavioral', name: 'Behavioral Issues', description: 'Aggression, anxiety, training' }
        ],
        'cat': [
            { _id: 'urinary', name: 'Urinary Issues', description: 'UTI, kidney problems, bladder stones' },
            { _id: 'respiratory', name: 'Respiratory Problems', description: 'Upper respiratory infections' },
            { _id: 'digestive', name: 'Digestive Issues', description: 'Hairballs, vomiting, diarrhea' },
            { _id: 'dental', name: 'Dental Problems', description: 'Tooth resorption, gum disease' },
            { _id: 'skin-issues', name: 'Skin Conditions', description: 'Fleas, allergies, infections' },
            { _id: 'behavioral', name: 'Behavioral Issues', description: 'Litter box problems, aggression' }
        ],
        'horse': [
            { _id: 'lameness', name: 'Lameness', description: 'Leg and hoof problems' },
            { _id: 'colic', name: 'Colic', description: 'Digestive emergencies' },
            { _id: 'respiratory', name: 'Respiratory Issues', description: 'Heaves, allergies' },
            { _id: 'dental', name: 'Dental Problems', description: 'Teeth floating, malocclusions' },
            { _id: 'reproductive', name: 'Reproductive Health', description: 'Breeding, pregnancy issues' },
            { _id: 'skin-issues', name: 'Skin Conditions', description: 'Rain rot, sweet itch' }
        ],
        'pigs': [
            { _id: 'respiratory', name: 'Respiratory Issues', description: 'Pneumonia, PRRS' },
            { _id: 'digestive', name: 'Digestive Problems', description: 'Diarrhea, constipation' },
            { _id: 'reproductive', name: 'Reproductive Health', description: 'Breeding, farrowing issues' },
            { _id: 'skin-issues', name: 'Skin Conditions', description: 'Mange, sunburn' },
            { _id: 'lameness', name: 'Lameness', description: 'Leg and joint problems' },
            { _id: 'behavioral', name: 'Behavioral Issues', description: 'Aggression, stress' }
        ],
        'birds': [
            { _id: 'respiratory', name: 'Respiratory Issues', description: 'Air sac infections, sinusitis' },
            { _id: 'digestive', name: 'Digestive Problems', description: 'Crop issues, diarrhea' },
            { _id: 'feather', name: 'Feather Problems', description: 'Plucking, molting issues' },
            { _id: 'behavioral', name: 'Behavioral Issues', description: 'Screaming, aggression' },
            { _id: 'reproductive', name: 'Reproductive Health', description: 'Egg binding, breeding issues' },
            { _id: 'nutritional', name: 'Nutritional Issues', description: 'Vitamin deficiencies' }
        ],
        'cattle': [
            { _id: 'mastitis', name: 'Mastitis', description: 'Udder infections' },
            { _id: 'lameness', name: 'Lameness', description: 'Hoof problems, joint issues' },
            { _id: 'reproductive', name: 'Reproductive Health', description: 'Breeding, calving issues' },
            { _id: 'respiratory', name: 'Respiratory Issues', description: 'Pneumonia, shipping fever' },
            { _id: 'digestive', name: 'Digestive Problems', description: 'Bloat, acidosis' },
            { _id: 'metabolic', name: 'Metabolic Issues', description: 'Milk fever, ketosis' }
        ],
        'poultry': [
            { _id: 'respiratory', name: 'Respiratory Issues', description: 'Newcastle disease, bronchitis' },
            { _id: 'digestive', name: 'Digestive Problems', description: 'Coccidiosis, diarrhea' },
            { _id: 'reproductive', name: 'Reproductive Health', description: 'Egg production issues' },
            { _id: 'behavioral', name: 'Behavioral Issues', description: 'Cannibalism, feather pecking' },
            { _id: 'nutritional', name: 'Nutritional Issues', description: 'Vitamin deficiencies' },
            { _id: 'parasitic', name: 'Parasitic Infections', description: 'Worms, mites, lice' }
        ]
    };
    return diseaseMap[animalType] || [];
};