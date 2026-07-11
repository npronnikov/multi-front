import { HttpBadRequest } from '@httpx/exception'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { homeConfig } from '@/features/home/home.config'
import { HomePage } from '@/features/home/pages'
import { getServerTranslations } from '@/lib/i18n'

type Props = {
  /** Add HomeRoute props here */
}

export default function DemoRoute(_props: InferGetStaticPropsType<typeof getStaticProps>) {
  return <HomePage />
}

export const getStaticProps: GetStaticProps<Props> = async context => {
  const { locale } = context
  if (locale === undefined) {
    throw new HttpBadRequest('locale is missing')
  }
  const { i18nNamespaces } = homeConfig
  return {
    props: {
      ...(await getServerTranslations(locale, i18nNamespaces)),
    },
  }
}
