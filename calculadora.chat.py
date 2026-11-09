
continuar = "s"
while  continuar == "s":

 print("-----------------------")
 print("===  CALCULADORA  ===")
 print("-----------------------")

 while True:
   try:
    opcao = int(input("Digite 1 para soma, 2 para subtração, 3 para multiplicação e 4 para divisão: "))
    if opcao != 1 and opcao != 2 and opcao != 3 and opcao != 4:
      print("Opção inválida. ")
    else:
       break  
   except ValueError:
    print("Você precisa digitar 1, 2, 3 ou 4. Tente novamente.")

 while True:
    try:
        n1 = float(input("Digite um número: "))

        break
    except ValueError:
        print("Valor inválido! Você precisa digitar apenas números. Tente novamente.")

    
 while True:
    try:
        
        n2 = float(input("Digite outro número: "))

        break
    except ValueError:
        print("Valor inválido! Você precisa digitar apenas números. Tente novamente.")
    
 if opcao == 1:
     soma = n1 + n2
     print(f"Soma: {soma}")
 elif opcao == 2:
    subtracao = n1 - n2
    print(f"Subtração: {subtracao}")
 elif opcao == 3:
    multiplicacao = n1 * n2
    print(f"Multiplicação: {multiplicacao}")
 elif opcao == 4:
    if n2 == 0:
        print("Erro: Divisão por zero não é permitida.")
    else:
     divisao = n1 / n2
     print(f"Divisão: {divisao}")

 continuar = input("Deseja continuar? (s/n): ").strip().lower()
 while continuar != "s" and continuar != "n":
        print("Opção inválida. Digite 's' para continuar ou 'n' para encerrar.")
        continuar = input("Deseja continuar? (s/n): ").strip().lower()
   

