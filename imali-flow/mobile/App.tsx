import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { analyseImage, analyseText, authenticate, clearToken } from './src/api';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const run = async (fn: () => Promise<void>) => {
    setError('');
    try { await fn(); } catch (e: any) { setError(e.message); }
  };

  if (!loggedIn) {
    return (
      <View style={s.c}>
        <Text style={s.h}>Imali Flow</Text>
        <TextInput style={s.i} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextInput style={s.i} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Button title="Log in" onPress={() => run(async () => { await authenticate('login', email, password); setLoggedIn(true); })} />
        <Button title="Register" onPress={() => run(async () => { await authenticate('register', email, password); setLoggedIn(true); })} />
        {!!error && <Text style={s.e}>{error}</Text>}
        <StatusBar style="auto" />
      </View>
    );
  }

  const snap = () => run(async () => {
    const pick = await ImagePicker.launchCameraAsync({ quality: 0.5 }); // lower quality = less data
    if (!pick.canceled) setResult(await analyseImage(pick.assets[0].uri));
  });

  return (
    <ScrollView contentContainerStyle={s.c}>
      <Text style={s.h}>Snap and Explain</Text>
      <Button title="Take a photo of the offer" onPress={snap} />
      <TextInput style={[s.i, { height: 90 }]} multiline placeholder="...or paste the SMS / offer text" value={text} onChangeText={setText} />
      <Button title="Check this text" onPress={() => run(async () => setResult(await analyseText(text)))} />
      {!!error && <Text style={s.e}>{error}</Text>}
      {result && (
        <View>
          <Text style={s.b}>Scam likelihood: {result.scam_likelihood}</Text>
          <Text>{result.summary}</Text>
          {result.red_flags?.map((f: string, i: number) => <Text key={i}>• {f}</Text>)}
          <Button title="Read aloud" onPress={() => Speech.speak(result.summary)} />
          <Text style={s.n}>Guidance only, not financial advice.</Text>
        </View>
      )}
      <Button title="Log out" onPress={async () => { await clearToken(); setLoggedIn(false); }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { padding: 24, paddingTop: 64, gap: 12 },
  h: { fontSize: 24, fontWeight: '700' },
  i: { borderWidth: 1, borderColor: '#999', borderRadius: 6, padding: 10 },
  e: { color: 'crimson' },
  b: { fontWeight: '700', marginTop: 12 },
  n: { fontSize: 12, color: '#555', marginTop: 8 },
});
