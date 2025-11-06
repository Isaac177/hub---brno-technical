const cyrillicToLatin: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
    'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
    'э': 'e', 'ю': 'yu', 'я': 'ya',
    // Kazakh specific letters
    'ә': 'a', 'і': 'i', 'ң': 'n', 'ғ': 'g', 'ү': 'u',
    'ұ': 'u', 'қ': 'k', 'ө': 'o', 'һ': 'h'
};

export const customSlugify = (text: string): string => {
    if (!text) return '';

    let slug = text.toLowerCase();

    slug = slug.split('').map(char => cyrillicToLatin[char] || char).join('');

    slug = slug
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');

    return slug;
};
