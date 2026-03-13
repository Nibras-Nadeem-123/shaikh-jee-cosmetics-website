import { Category, Review } from '@/types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Face',
    slug: 'face',
    image: 'https://images.unsplash.com/photo-1546951400-c106ca5fc813?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3VuZGF0aW9uJTIwbWFrZXVwJTIwY29zbWV0aWNzfGVufDF8fHx8MTc2NzM3NTQyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Foundation, Concealer, Blush'
  },
  {
    id: '2',
    name: 'Eyes',
    slug: 'eyes',
    image: 'https://images.unsplash.com/photo-1583012279653-1575246476c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleWVzaGFkb3clMjBwYWxldHRlJTIwYmVhdXR5fGVufDF8fHx8MTc2NzM3NTQyMnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Eyeliner, Mascara, Eyeshadow'
  },
  {
    id: '3',
    name: 'Lips',
    slug: 'lips',
    image: 'https://images.unsplash.com/photo-1523634118614-82b2685ee3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXBzdGljayUyMGJlYXV0eSUyMHByb2R1Y3R8ZW58MXx8fHwxNzY3Mzc2MDE1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Lipstick, Gloss, Balm'
  },
  {
    id: '4',
    name: 'Skincare',
    slug: 'skincare',
    image: 'https://images.unsplash.com/photo-1643379850623-7eb6442cd262?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwYm90dGxlfGVufDF8fHx8MTc2NzMwNzc0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Cleanser, Serum, Sunscreen'
  },
  {
    id: '5',
    name: 'Beauty Tools',
    slug: 'beauty-tools',
    image: 'https://images.unsplash.com/photo-1659517175423-9e94aa553374?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBicnVzaGVzJTIwdG9vbHN8ZW58MXx8fHwxNzY3Mzc1NDIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Brushes, Sponges, Tools'
  },
  {
    id: '6',
    name: 'Gift Sets',
    slug: 'gift-sets',
    image: 'https://images.unsplash.com/photo-1765887986673-953fccf56464?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpY3MlMjBnaWZ0JTIwc2V0fGVufDF8fHx8MTc2NzM3NTQyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Combos & Gift Sets'
  }
];

export const testimonials = [
  {
    id: 't1',
    name: 'Riya Kapoor',
    rating: 5,
    comment: 'Shaikh Jee has the best cosmetics! Premium quality at affordable prices.',
    location: 'Mumbai',
  },
  {
    id: 't2',
    name: 'Sana Ahmed',
    rating: 5,
    comment: 'Fast delivery and amazing products. My go-to brand for all beauty needs.',
    location: 'Delhi',
  },
  {
    id: 't3',
    name: 'Kavya Reddy',
    rating: 5,
    comment: 'Love the packaging and product quality. Highly recommended!',
    location: 'Bangalore',
  },
];
