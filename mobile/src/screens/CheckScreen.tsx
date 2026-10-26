import React, { useState } from 'react';
import { View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AppText from '../components/AppText';
import Banner from '../components/Banner';
import Button from '../components/Button';
import Field from '../components/Field';
import FadeIn from '../components/FadeIn';
import Screen from '../components/Screen';
import { AiResultView, OfferResultView } from '../components/ResultViews';
import { useSettings, useT } from '../context/SettingsContext';
import { ApiError } from '../api/client';
import { analyseImage, analyseOffer, analyseText } from '../api/services';
import { errorText } from '../utils/errors';
import { colors } from '../theme';
import type { AiResult, OfferResult } from '../types';

const MAX_BYTES = 5 * 1024 * 1024;

// Privacy: photos and text are sent for checking only. Nothing is saved or logged on the phone.
export default function CheckScreen() {
  const t = useT();
  const { language } = useSettings();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [aiDown, setAiDown] = useState(false);
  const [ai, setAi] = useState<AiResult | null>(null);
  const [rules, setRules] = useState<OfferResult | null>(null);

  const reset = () => { setAi(null); setRules(null); setError(''); setAiDown(false); setText(''); };

  const handle = (e: unknown) => {
    if (e instanceof ApiError && e.status === 503) { setAiDown(true); setError(t('aiDown')); return; }
    setError(errorText(e, t));
  };

  const checkText = async () => {
    if (!text.trim()) return;
    setBusy(true); setError(''); setAiDown(false);
    try { setAi(await analyseText(text.trim(), language)); } catch (e) { handle(e); } finally { setBusy(false); }
  };

  const checkRules = async () => {
    setBusy(true); setError('');
    try { setRules(await analyseOffer(text.trim())); setAiDown(false); } catch (e) { setError(errorText(e, t)); } finally { setBusy(false); }
  };

  const checkPhoto = async (camera: boolean) => {
    setError(''); setAiDown(false);
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 }; // lower quality = less data
    const pick = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (pick.canceled || !pick.assets?.[0]) return;
    const asset = pick.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_BYTES) { setError(t('errTooBig')); return; }
    setBusy(true);
    try { setAi(await analyseImage(asset.uri, language)); } catch (e) { handle(e); } finally { setBusy(false); }
  };

  const showing = ai || rules;

  return (
    <Screen>
      <AppText variant="title">{t('checkTitle')}</AppText>

      {!showing ? (
        <>
          <Button title={t('takePhoto')} icon="camera-outline" loading={busy} onPress={() => void checkPhoto(true)} />
          <Button variant="secondary" title={t('fromGallery')} icon="image-outline" disabled={busy} onPress={() => void checkPhoto(false)} />
          <Field label={t('pasteText')} value={text} onChangeText={setText} multiline maxLength={8000}
            placeholder={t('pastePlaceholder')} style={{ minHeight: 120, textAlignVertical: 'top', paddingTop: 12 }} />
          {error ? <Banner color={aiDown ? colors.amber : colors.red} icon={aiDown ? 'cloud-offline-outline' : 'alert-circle'} text={error} /> : null}
          <Button title={t('check')} icon="shield-checkmark-outline" loading={busy} disabled={!text.trim()} onPress={() => void checkText()} />
          {aiDown && text.trim() ? <Button variant="secondary" title={t('runRules')} onPress={() => void checkRules()} /> : null}
          <AppText variant="small" color={colors.muted}>{t('noKeep')}</AppText>
        </>
      ) : (
        <View style={{ gap: 14 }}>
          <FadeIn>
            {ai ? <AiResultView r={ai} /> : null}
            {rules ? <OfferResultView r={rules} /> : null}
          </FadeIn>
          <Button variant="secondary" title={t('checkAnother')} icon="refresh" onPress={reset} />
        </View>
      )}
    </Screen>
  );
}
