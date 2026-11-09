
import random

tentativas = 0
print("Bem-vindo ao jogo de adivinhação!")


def escolher_dificuldade():
  print("Escolha um nível de dificuldade:")
  print("1 - Fácil (1 a 100)")
  print("2 - Médio (1 a 500)")
  print("3 - Difícil (1 a 1000)")

  nivel = input("Digite o número do nível desejado: ")
  while nivel != "1" and nivel != "2" and nivel != "3":
    print("Opção inválida.")
    nivel = input("Digite o número do nível desejado: ")

  if nivel == "1":
    limite = 100
  elif nivel == "2":
    limite = 500
  elif nivel == "3":
    limite = 1000

  return limite    


def verificar_tentativa(tentativa, secreto):
        if tentativa == secreto:
            return "acertou"
        elif tentativa < secreto:
            return "baixo"
        else:
            return "alto"
        

while True:
 limite = escolher_dificuldade()
 secreto = random.randint(1, limite)
 tentativas = 0
 max_tentaivas = 10       

 while tentativas < max_tentaivas:
    try:
        tentativa = int(input("Digite um número: "))
        
    except ValueError:
        print("Por favor, digite um número.")
        continue
    
    if tentativa < 1 or tentativa > limite:
            print("Número fora dos intervalo permitido.")
            continue
    tentativas += 1

    resultado = verificar_tentativa(tentativa, secreto)
    if resultado == "acertou":
     print("Acertou!")
     print("Tentativas:", tentativas)
     break
   
    elif resultado == "baixo":
     print("Muito baixo!")

    else:
     print("Muito alto!")

 if tentativas == max_tentaivas:
    print("Você perdeu! O número secreto era:", secreto)

 jogar_novamente = input("Você quer jogar novamente? (s/n): ")

 while jogar_novamente != "s" and jogar_novamente != "n":
    print("Opção inválida.")
    jogar_novamente = input("Você quer jogar novamente? (s/n): ")

 if jogar_novamente == "n":
  break
        
    