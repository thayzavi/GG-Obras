import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Text, Button, Card, Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../Services/api';

export default function Assistente() {
  const [visivel, setVisivel] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [respostas, setResposta] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const enviarPergunta = async () => {
    if (!mensagem.trim()) return;

    const perguntaAtual = mensagem;
    setResposta(prev => [...prev, { pergunta: perguntaAtual, resposta: '', autor: 'usuário' }]);
    setMensagem('');
    setCarregando(true);

    try {
      const response = await api.post('/api/assistente', {
        pergunta: perguntaAtual,
      });

      setResposta(prev => [
        ...prev.slice(0, -1),
        { pergunta: perguntaAtual, resposta: response.data.resposta, autor: 'usuário' },
        { pergunta: '', resposta: response.data.resposta, autor: 'assistente' },
      ]);
    } catch (err) {
      setResposta(prev => [
        ...prev,
        { pergunta: '', resposta: 'Erro ao consultar o assistente.', autor: 'assistente' },
      ]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <PaperProvider>
      <Modal visible={visivel} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={styles.chatBox}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={10}
          >
            <ScrollView contentContainerStyle={styles.chatContainer}>
                 <Button onPress={() => setVisivel(false)} textColor="red" style={styles.fechar}>
              Fechar
            </Button>
            
              {respostas.map((r, i) => (
                <View
                  key={i}
                  style={[
                    styles.mensagemContainer,
                    r.autor === 'usuário' ? styles.user : styles.assistente,
                  ]}
                >
                  {r.autor !== 'usuário' && (
                    <Image source={require('../../assets/bot.png')} style={styles.avatar} />
                  )}
                  <View
                    style={[
                      styles.mensagem,
                      r.autor === 'usuário' ? styles.usuario : styles.bot,
                    ]}
                  >
                    <Text style={styles.textoMensagem}>
                      {r.autor === 'usuário' ? r.pergunta : r.resposta}
                    </Text>
                  </View>
                  {r.autor === 'usuário' && (
                    <View style={styles.userAvatar}>
                      <MaterialIcons name="person" size={25} color="#A34003" />
                    </View>
                  )}
                </View>
              ))}
              {carregando && (
                <ActivityIndicator animating={true} color="#A34003" style={{ marginTop: 10 }} />
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Pergunte algo sobre as obras..."
                value={mensagem}
                onChangeText={setMensagem}
                mode="outlined"
                style={styles.input}
                multiline
              />
              <Button
                mode="contained"
                onPress={enviarPergunta}
                disabled={carregando}
                contentStyle={styles.btn}
                style={styles.rdBtn}
              >
                <MaterialIcons name="send" size={20} color="#fff" />
              </Button>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={() => setVisivel(true)}>
        <Image source={require('../../assets/bot.png')} style={styles.fabImg} />
      </TouchableOpacity>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#A34003',
    borderRadius: 50,
    padding: 16,
    elevation: 5,
    zIndex: 999,
  },
  fabImg:{
    height: 40,
    width: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  chatBox: {
    height: '75%',
    backgroundColor: '#F4F6F6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
  },
  chatContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  mensagemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
  },
  user: {
    justifyContent: 'flex-end',
  },
  assistente: {
    justifyContent: 'flex-start',
  },
  mensagem: {
    padding: 10,
    borderRadius: 10,
    maxWidth: '70%',
  },
  fechar:{
    marginTop: 6 ,
    marginInlineEnd:'auto',
  },
  usuario: {
    backgroundColor: '#F9A068',
    borderTopRightRadius: 0,
  },
  bot: {
    backgroundColor: '#A34003',
    borderTopLeftRadius: 0,
  },
  textoMensagem: {
    fontSize: 16,
    color: '#fff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 6,
    backgroundColor: '#fff',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 53,
    marginBottom: 14,
    backgroundColor: '#E6E6E6',
    borderColor: '#fff',
  },
  rdBtn: {
    marginLeft: 10,
    borderRadius: 100,
    backgroundColor: '#A34003',
  },
});
