import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './index.css'; // Importa o visual corporativo

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_5OqcEbyTG',
      userPoolClientId: '28ct7m5scvfhh192i4r4fnbuft',
    }
  }
});

// Customizando o cabeçalho do formulário de login
const components = {
  Header() {
    return (
      <div style={{ textAlign: 'center', padding: '30px 0 20px 0' }}>
        <h2 style={{ color: '#1e3a8a', margin: 0, fontSize: '26px', fontWeight: 'bold' }}>
          ✦ CorpSystem
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '5px', marginBottom: 0 }}>
          Portal Corporativo
        </p>
      </div>
    );
  },
};

function App() {
  return (
    <div style={{ width: '100%', minWidth: '350px' }}>
      <Authenticator components={components}>
        {({ signOut, user }) => (
          <main style={{ padding: '30px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h1 style={{ color: '#1e3a8a', fontSize: '22px' }}>Painel Interno</h1>
            <p style={{ color: '#374151' }}>Bem-vindo, <strong>{user?.username}</strong></p>
            
            <hr style={{ margin: '20px 0', borderColor: '#e5e7eb', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />
            
            <button 
              onClick={signOut} 
              style={{ 
                padding: '10px 20px', 
                cursor: 'pointer', 
                backgroundColor: '#dc2626', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                fontWeight: 'bold',
                width: '100%'
              }}>
              Encerrar Sessão
            </button>
          </main>
        )}
      </Authenticator>
    </div>
  );
}

export default App;