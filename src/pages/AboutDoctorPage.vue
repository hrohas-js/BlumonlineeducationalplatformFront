<script setup lang="ts">
import AppLayout from '@/components/layouts/AppLayout.vue'
import AboutDoctorAccordion, {
  type AboutDoctorAccordionItem,
} from '@/components/organisms/AboutDoctorAccordion.vue'

import image12 from '@/assets/img/webp/12.webp'
import image3 from '@/assets/img/webp/3.webp'
import image45 from '@/assets/img/webp/45.webp'

const accordionItems: AboutDoctorAccordionItem[] = [
  {
    title: 'Становление',
    imageSrc: image12,
    imageAlt: 'Становление',
    content: [
      {
        type: 'paragraph',
        text: 'Не смотря на то, что я из семьи врачей в 3-м поколении, решение пойти учиться на врача было неоднозначным!',
      },
      {
        type: 'paragraph',
        text: 'Но, в юношеском возрасте не всегда Мы принимает решения и на "семейном совете" обсудив все детали и придя к "общему знаменателю", оптимальным вариантом стало - пойти учиться в медицинский институт....',
      },
    ],
  },
  {
    title: 'Среднее образование',
    imageSrc: image3,
    imageAlt: 'Среднее образование',
    content: [
      {
        type: 'paragraph',
        text: 'Школьная пора!!! Один из главных этапов становления и постановка целей на дальнейшие достижения.',
      },
      {
        type: 'paragraph',
        text: 'Среднее образование - золотая медаль! (Спасибо родителям за упорство и желание развиваться).',
      },
    ],
  },
  {
    title: 'Высшее образование',
    imageSrc: image3,
    imageAlt: 'Высшее образование',
    content: [
      {
        type: 'paragraph',
        text: 'Период обучения в институте стал логичным продолжением школьной дисциплины: высокий темп, постоянная работа над собой и четкий фокус на медицинской практике.',
      },
      {
        type: 'paragraph',
        text: 'Именно в это время сформировалась профессиональная база, которая позже позволила уверенно двигаться вперед, углублять знания и развиваться в выбранной специальности.',
      },
    ],
  },
  {
    title: 'Проф. переподготовка',
    imageSrc: image45,
    imageAlt: 'Профессиональная переподготовка',
    content: [
      {
        type: 'paragraph',
        text: 'За 22 года нахождения в профессии было все:',
        strong: true,
      },
      {
        type: 'paragraph',
        text: 'разные места работы, повышение и пересмотр профессиональной квалификации, прохождение всевозможных вебинаров, курсов, бесконечная учеба.....',
      },
    ],
  },
  {
    title: 'Выводы',
    imageSrc: image45,
    imageAlt: 'Выводы',
    content: [
      {
        type: 'paragraph',
        text: 'И когда мне задают вопросы:',
      },
      {
        type: 'list',
        items: ['в чем Ваш секрет?', 'какой магией Вы обладаете?'],
      },
      {
        type: 'paragraph',
        text: 'Ответ простой - Быть постоянным учеником и заниматься любимым делом!',
        strong: true,
      },
    ],
  },
]
</script>

<template>
  <AppLayout content-mode="boxed">
    <AboutDoctorAccordion :items="accordionItems" />
  </AppLayout>
</template>
