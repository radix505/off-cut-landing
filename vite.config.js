import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { openingHoursSpecification } from './src/data/businessHours.js'

const businessSchemaPlugin = {
  name: 'inject-business-schema',
  transformIndexHtml() {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'HairSalon',
      name: 'OFF CUT Barbershop',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Bolesława Krzywoustego 27 U4',
        postalCode: '70-316',
        addressLocality: 'Szczecin',
        addressCountry: 'PL',
      },
      telephone: '+48513340013',
      email: 'offcutszczecin@gmail.com',
      openingHoursSpecification: openingHoursSpecification(),
    }
    return [{
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      children: JSON.stringify(ld),
      injectTo: 'head',
    }]
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), businessSchemaPlugin],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
        },
      },
    },
  },
})
