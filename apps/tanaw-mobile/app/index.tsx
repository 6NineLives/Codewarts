import { Redirect } from 'expo-router';

/** Default entry — send `/` to the Translate tab. */
export default function Index() {
  return <Redirect href="/translate" />;
}
