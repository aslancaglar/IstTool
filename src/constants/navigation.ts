export const MENU_CATEGORIES = [
  { id: 'tous', label: 'Tous', href: '#tous' },
  { id: 'kebabs', label: 'Kebabs', href: '#kebabs' },
  { id: 'sandwichs', label: 'Sandwichs', href: '#sandwichs' },
  { id: 'assiettes', label: 'Assiettes', href: '#assiettes' },
  { id: 'burgers', label: 'Burgers', href: '#burgers' },
  { id: 'tacos', label: 'Tacos', href: '#tacos' },
  { id: 'enfants', label: 'Enfants', href: '#enfants' },
  { id: 'accompagnements', label: 'Accompagnements', href: '#accompagnements' },
  { id: 'boissons', label: 'Boissons', href: '#boissons' },
  { id: 'bieres', label: 'Bières', href: '#bieres' },
  { id: 'vins', label: 'Vins', href: '#vins' },
  { id: 'desserts', label: 'Desserts', href: '#desserts' },
] as const;

export const NAV_LINKS = [
  { id: 'accueil', label: 'Accueil', href: '/#accueil' },
  { id: 'a-propos', label: 'À Propos', href: '/#a-propos' },
  { id: 'menu', label: 'Menu', href: '/menu' },
  { id: 'avis', label: 'Avis', href: '/#avis' },
  { id: 'galerie', label: 'Galerie', href: '/#galerie' },
  { id: 'contact', label: 'Contact', href: '/#contact' },
] as const;

export const CONTACT_INFO = {
  phone: '07 82 81 46 56',
  phoneHref: 'tel:0782814656',
  address: {
    street: '123 Rue Principale',
    city: 'Thionville',
    postalCode: '57100',
  },
  hours: {
    weekdays: 'Lun - Sam: 11h00 - 22h00',
    sunday: 'Dimanche: 12h00 - 21h00',
  },
} as const;
