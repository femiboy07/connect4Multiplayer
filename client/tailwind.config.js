/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx,jsx}"],
  theme: {
    extend: {
       keyframes:{
          minimmize:{
            from:{
              justifyItem:'center'

            },

            to:{
               justifyItem:'end'
            }
          },

          scaleUpMd: {
            '0%': { transform: 'scale(0.5)' },  // Start small
            '100%': { transform: 'scale(2.5)' }, // End large
          },

          scaleUpSm: {
            '0%': { transform: 'scale(0.5)' },  // Start small
            '100%': { transform: 'scale(1)' }, // End large
          },

       },
       animation:{
        'minimize':'minimize 2s ease-in-out 2s  ',
        scaleUpMd:'scaleUpMd 2s ease-in-out forwards',
        scaleUpSm:'scaleUpSm 2s ease-in-out forwards'
       }
    },
  },
  plugins: [],
}

