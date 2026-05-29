import PetWindow from './pet/PetWindow';
import { SettingsWindow } from './settings/SettingsWindow';

export default function App() {
  const isSettingsView = new URLSearchParams(window.location.search).get('view') === 'settings';

  return isSettingsView ? <SettingsWindow /> : <PetWindow />;
}
