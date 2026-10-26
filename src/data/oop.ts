// POO (programação orientada a objetos) para estágio, em português e gamificado.
// Progress is stored in ukiepc_progress under `oop:<world-id>:<item-id>` (tasks, quiz questions
// and challenge checklist items alike). Ids are hand-written, so rewording a title is safe.
// Code examples are Java, the usual language for OOP interviews at internship level.

import { leetcodeUrl } from "@/data/ukiepc";

export type OopTaskKind = "ler" | "assistir" | "praticar";

export interface OopTask {
  id: string;
  kind: OopTaskKind;
  title: string;
  url: string;
  xp: number;
}

export interface OopQuestion {
  id: string;
  q: string;
  options: string[];
  /** index into options */
  answer: number;
  why: string;
}

export interface OopChallenge {
  title: string;
  brief: string;
  /** checklist the solver ticks off herself */
  steps: { id: string; text: string }[];
}

export type LessonBlock = { p: string } | { code: string } | { tip: string };

export interface OopWorld {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  lesson: LessonBlock[];
  tasks: OopTask[];
  quiz: OopQuestion[];
  challenge: OopChallenge;
}

export const XP = { quiz: 15, step: 10 };

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
// Gustavo Guanabara's "Curso de POO Java" (Curso em Vídeo): "a" episodes are theory, "b" are Java
const cev = (id: string) => `https://www.youtube.com/watch?v=${id}&list=PLHz_AreHm4dkqe2aR0tQK74m8SFe-aGsY`;
// Caelum's free FJ-11 handout "Java e Orientação a Objetos", now hosted by Alura
const apostila = (chapter: string) => `https://www.alura.com.br/apostila-java-orientacao-objetos/${chapter}`;
const alura = (slug: string) => `https://www.alura.com.br/artigos/${slug}`;
const guru = (slug: string) => `https://refactoring.guru/pt-br/design-patterns/${slug}`;

export const oopWorlds: OopWorld[] = [
  {
    id: "classes",
    emoji: "🥚",
    name: "Classes e Objetos",
    tagline: "a forminha e o biscoito",
    lesson: [
      {
        p: "Uma classe é o molde (a forminha de biscoito). Um objeto é uma coisa concreta feita a partir do molde (o biscoito). A classe diz quais dados o objeto guarda (atributos) e o que ele sabe fazer (métodos).",
      },
      {
        code: `public class Cachorro {
    String nome;      // atributo
    int idade;        // atributo

    // construtor: roda quando você faz "new"
    public Cachorro(String nome, int idade) {
        this.nome = nome;   // this = "este objeto aqui"
        this.idade = idade;
    }

    public void latir() {  // método
        System.out.println(nome + " diz: au au!");
    }
}

Cachorro rex = new Cachorro("Rex", 3);   // um objeto
Cachorro bolt = new Cachorro("Bolt", 5); // outro objeto
rex.latir();  // Rex diz: au au!`,
      },
      {
        p: "Cada objeto tem os seus próprios valores: mudar a idade do rex não muda a do bolt. O construtor é o método especial que inicializa o objeto, e o this desfaz a confusão entre o atributo e o parâmetro de mesmo nome.",
      },
      {
        tip: "Na entrevista: \"classe é a definição, objeto é a instância\". Se perguntarem o que é static: um atributo/método static pertence à classe, não a cada objeto (ex: um contador de quantos cachorros já foram criados).",
      },
    ],
    tasks: [
      { id: "cev-01a", kind: "assistir", title: "Curso em Vídeo #01a: O que é POO", url: cev("KlIL63MeyMY"), xp: 15 },
      { id: "cev-02a", kind: "assistir", title: "Curso em Vídeo #02a: O que é um objeto?", url: cev("aR7CKNFECx0"), xp: 15 },
      { id: "cev-02b", kind: "assistir", title: "Curso em Vídeo #02b: Criando classes e objetos em Java", url: cev("wNaoX6VOj54"), xp: 15 },
      { id: "apostila-basica", kind: "ler", title: "Apostila Caelum: Orientação a Objetos Básica (faça os exercícios!)", url: apostila("orientacao-a-objetos-basica"), xp: 20 },
      { id: "alura-poo", kind: "ler", title: "Alura: o que é programação orientada a objetos", url: alura("poo-programacao-orientada-a-objetos"), xp: 10 },
    ],
    quiz: [
      {
        id: "q1",
        q: "Qual a diferença entre classe e objeto?",
        options: ["São a mesma coisa", "Classe é o molde, objeto é uma instância criada a partir dele", "Objeto é o molde, classe é a instância", "Classe só existe em Python"],
        answer: 1,
        why: "A classe define atributos e métodos; cada new cria um objeto (instância) com seus próprios valores.",
      },
      {
        id: "q2",
        q: "Para que serve o construtor?",
        options: ["Apagar o objeto", "Inicializar o objeto quando ele é criado com new", "Herdar de outra classe", "Deixar os atributos privados"],
        answer: 1,
        why: "O construtor roda no momento do new e coloca o objeto num estado válido.",
      },
      {
        id: "q3",
        q: "Em this.nome = nome; o que é this.nome?",
        options: ["O parâmetro do construtor", "Uma variável global", "O atributo do objeto atual", "Um erro de compilação"],
        answer: 2,
        why: "this aponta para o objeto que está sendo construído/usado; sem ele, nome se refere ao parâmetro.",
      },
      {
        id: "q4",
        q: "Um atributo static...",
        options: ["É compartilhado por todos os objetos da classe", "Não pode mudar nunca", "Existe uma cópia por objeto", "Só pode ser usado dentro do construtor"],
        answer: 0,
        why: "static pertence à classe. Para \"não pode mudar\" a palavra é final.",
      },
    ],
    challenge: {
      title: "Desafio: a classe Livro 📚",
      brief: "Crie uma classe Livro e brinque com dois objetos dela no main.",
      steps: [
        { id: "c1", text: "Atributos titulo, autor e paginas" },
        { id: "c2", text: "Construtor que recebe os três" },
        { id: "c3", text: "Método descricao() que devolve \"Titulo, de Autor (N páginas)\"" },
        { id: "c4", text: "No main, crie 2 livros e imprima a descrição dos dois" },
        { id: "c5", text: "Bônus: um contador static de quantos livros foram criados" },
      ],
    },
  },
  {
    id: "encapsulamento",
    emoji: "🔒",
    name: "Encapsulamento",
    tagline: "ninguém mexe no meu saldo",
    lesson: [
      {
        p: "Encapsular é esconder os dados de dentro do objeto e só deixar mexer neles pelos métodos que você escolher. Assim o objeto protege as próprias regras (invariantes): uma conta bancária nunca fica com saldo negativo porque ninguém de fora consegue escrever no saldo direto.",
      },
      {
        code: `public class ContaBancaria {
    private double saldo;   // ninguém de fora enxerga

    public double getSaldo() {   // getter: só leitura
        return saldo;
    }

    public void depositar(double valor) {
        if (valor <= 0) throw new IllegalArgumentException("valor inválido");
        saldo += valor;
    }

    public void sacar(double valor) {
        if (valor > saldo) throw new IllegalStateException("saldo insuficiente");
        saldo -= valor;
    }
}

conta.saldo = -1000;  // ❌ não compila: saldo é private`,
      },
      {
        p: "Modificadores de acesso em Java: private (só a própria classe), sem nada/package-private (o mesmo pacote), protected (pacote + subclasses) e public (todo mundo). Regra de bolso: atributos private, métodos public só quando precisam ser.",
      },
      {
        tip: "Na entrevista: encapsulamento não é \"botar getter e setter em tudo\". Um setSaldo público estragaria a proteção. Exponha comportamentos (depositar, sacar), não os dados crus.",
      },
    ],
    tasks: [
      { id: "cev-03a", kind: "assistir", title: "Curso em Vídeo #03a: O que é visibilidade?", url: cev("jFI-qqitzwk"), xp: 15 },
      { id: "cev-04b", kind: "assistir", title: "Curso em Vídeo #04b: Getter, setter e construtor", url: cev("6i-_R5cAcEc"), xp: 15 },
      { id: "cev-06a", kind: "assistir", title: "Curso em Vídeo #06a: Pilares da POO: Encapsulamento", url: cev("1wYRGFXpVlg"), xp: 15 },
      { id: "apostila-modificadores", kind: "ler", title: "Apostila Caelum: Modificadores de acesso e atributos de classe", url: apostila("modificadores-de-acesso-e-atributos-de-classe"), xp: 20 },
      { id: "alura-encapsulamento", kind: "ler", title: "Alura: o que é encapsulamento", url: alura("o-que-e-encapsulamento"), xp: 10 },
      { id: "lc-parking", kind: "praticar", title: "LeetCode 1603: Design Parking System (fácil)", url: leetcodeUrl("design-parking-system"), xp: 20 },
    ],
    quiz: [
      {
        id: "q1",
        q: "Por que deixar o saldo como private?",
        options: ["Para o código rodar mais rápido", "Para que só os métodos da classe possam alterá-lo e as regras sejam respeitadas", "Porque Java obriga", "Para outras classes poderem herdar"],
        answer: 1,
        why: "Com o atributo escondido, todo acesso passa por depositar/sacar, que validam os valores.",
      },
      {
        id: "q2",
        q: "Qual modificador deixa um membro visível no pacote e nas subclasses?",
        options: ["private", "public", "protected", "static"],
        answer: 2,
        why: "protected = mesmo pacote + subclasses (mesmo em outros pacotes).",
      },
      {
        id: "q3",
        q: "Uma classe com todos os atributos private mas um setter público para cada um está bem encapsulada?",
        options: ["Sim, está perfeita", "Não muito: qualquer um ainda pode colocar qualquer valor", "Sim, porque usa private", "Não compila"],
        answer: 1,
        why: "Os setters cegos devolvem o controle para fora. Encapsular é proteger as regras, não só usar private.",
      },
    ],
    challenge: {
      title: "Desafio: ContaBancaria à prova de bala 🏦",
      brief: "Implemente a conta do exemplo e tente quebrá-la.",
      steps: [
        { id: "c1", text: "saldo private, começando em 0" },
        { id: "c2", text: "depositar recusa valores ≤ 0" },
        { id: "c3", text: "sacar recusa quando não tem saldo" },
        { id: "c4", text: "Um método transferir(ContaBancaria destino, double valor)" },
        { id: "c5", text: "No main, tente sacar demais e veja a exceção acontecer" },
      ],
    },
  },
  {
    id: "heranca",
    emoji: "🧬",
    name: "Herança",
    tagline: "filho de peixe, peixinho é",
    lesson: [
      {
        p: "Herança deixa uma classe (a filha/subclasse) reaproveitar tudo de outra (a mãe/superclasse) e acrescentar ou mudar comportamentos. O teste é a frase \"é um\": um Gato é um Animal, então Gato extends Animal faz sentido.",
      },
      {
        code: `public class Animal {
    protected String nome;

    public Animal(String nome) { this.nome = nome; }

    public String som() { return "..."; }
}

public class Gato extends Animal {
    public Gato(String nome) {
        super(nome);        // chama o construtor da mãe
    }

    @Override
    public String som() {   // sobrescreve o método da mãe
        return "miau";
    }
}`,
      },
      {
        p: "super chama coisas da classe mãe (o construtor ou um método). @Override avisa o compilador que você está sobrescrevendo um método, e ele reclama se você errar o nome. Em Java uma classe só pode estender uma outra (herança simples), mas pode implementar várias interfaces.",
      },
      {
        tip: "Na entrevista: diga que herança cria acoplamento forte. Se mudar a mãe, todas as filhas sentem. Por isso o conselho \"prefira composição a herança\" (mundo 6).",
      },
    ],
    tasks: [
      { id: "cev-10a", kind: "assistir", title: "Curso em Vídeo #10a: Herança (parte 1)", url: cev("_PZldwo0vVo"), xp: 15 },
      { id: "cev-11a", kind: "assistir", title: "Curso em Vídeo #11a: Herança (parte 2)", url: cev("He887D2WGVw"), xp: 15 },
      { id: "cev-10b", kind: "assistir", title: "Curso em Vídeo #10b: Herança em Java", url: cev("19IGAeoFKlU"), xp: 15 },
      { id: "apostila-heranca", kind: "ler", title: "Apostila Caelum: Herança, reescrita e polimorfismo", url: apostila("heranca-reescrita-e-polimorfismo"), xp: 20 },
    ],
    quiz: [
      {
        id: "q1",
        q: "Qual dessas relações é uma boa candidata para herança?",
        options: ["Carro extends Motor", "Pedido extends Cliente", "Gerente extends Funcionario", "Lista extends Elemento"],
        answer: 2,
        why: "Gerente é um Funcionário. Carro tem um motor (composição), não é um motor.",
      },
      {
        id: "q2",
        q: "O que super(nome) faz dentro do construtor da filha?",
        options: ["Cria um objeto novo da classe mãe", "Chama o construtor da classe mãe", "Torna o atributo público", "Nada, é só um comentário"],
        answer: 1,
        why: "super(...) tem que ser a primeira linha e inicializa a parte \"mãe\" do objeto.",
      },
      {
        id: "q3",
        q: "Java permite class A extends B, C?",
        options: ["Sim", "Não, só uma superclasse por classe", "Só se B e C forem abstratas", "Só em Java 21+"],
        answer: 1,
        why: "Herança simples de classes; para \"herdar\" de várias coisas, use interfaces.",
      },
      {
        id: "q4",
        q: "Para que serve @Override?",
        options: ["É obrigatório para herdar", "Faz o compilador checar que você está mesmo sobrescrevendo um método da mãe", "Deixa o método mais rápido", "Torna o método estático"],
        answer: 1,
        why: "Sem ele, um erro de digitação cria um método novo sem você perceber.",
      },
    ],
    challenge: {
      title: "Desafio: a família dos Funcionários 👩‍💼",
      brief: "Modele uma empresa pequenininha com herança.",
      steps: [
        { id: "c1", text: "Classe Funcionario com nome e salarioBase" },
        { id: "c2", text: "Método salario() que devolve o salarioBase" },
        { id: "c3", text: "Gerente extends Funcionario, com bônus de 20% sobrescrevendo salario()" },
        { id: "c4", text: "Estagiario extends Funcionario, com salário fixo" },
        { id: "c5", text: "Use super.salario() dentro do Gerente" },
      ],
    },
  },
  {
    id: "polimorfismo",
    emoji: "🎭",
    name: "Polimorfismo",
    tagline: "um nome, muitas formas",
    lesson: [
      {
        p: "Polimorfismo é poder tratar objetos diferentes pelo mesmo tipo e cada um responder do seu jeito. Uma lista de Animal pode ter Gato e Cachorro, e chamar som() em cada um executa a versão certa. Quem decide qual versão roda é o tipo real do objeto, em tempo de execução.",
      },
      {
        code: `List<Animal> bichos = List.of(new Gato("Mimi"), new Cachorro("Rex"));

for (Animal a : bichos) {
    System.out.println(a.som());  // miau, au au
}

// sobrecarga (overload): mesmo nome, parâmetros diferentes
public int somar(int a, int b) { return a + b; }
public double somar(double a, double b) { return a + b; }`,
      },
      {
        p: "Dois tipos que sempre caem em entrevista. Sobrescrita (override): a filha redefine um método da mãe, com a mesma assinatura, e a escolha acontece em tempo de execução. Sobrecarga (overload): métodos com o mesmo nome e parâmetros diferentes na mesma classe, e a escolha acontece em tempo de compilação.",
      },
      {
        tip: "Na entrevista: o exemplo clássico é calcular a área de uma lista de Formas (Circulo, Retangulo) sem nenhum if/instanceof. Se você está escrevendo if (x instanceof Gato), provavelmente queria polimorfismo.",
      },
    ],
    tasks: [
      { id: "cev-12a", kind: "assistir", title: "Curso em Vídeo #12a: Polimorfismo (sobreposição)", url: cev("9-3-RMEMcq4"), xp: 15 },
      { id: "cev-13a", kind: "assistir", title: "Curso em Vídeo #13a: Polimorfismo (sobrecarga)", url: cev("hYek1xqWzgs"), xp: 15 },
      { id: "cev-12b", kind: "assistir", title: "Curso em Vídeo #12b: Polimorfismo em Java", url: cev("NctjqlfKC0U"), xp: 15 },
      { id: "apostila-poli", kind: "ler", title: "Apostila Caelum: a parte de polimorfismo do capítulo de herança", url: apostila("heranca-reescrita-e-polimorfismo") + "#polimorfismo", xp: 15 },
    ],
    quiz: [
      {
        id: "q1",
        q: "Animal a = new Gato(\"Mimi\"); a.som(); qual som() roda?",
        options: ["O de Animal, porque a variável é Animal", "O de Gato, porque o objeto real é um Gato", "Dá erro de compilação", "Os dois"],
        answer: 1,
        why: "Despacho dinâmico: vale o tipo do objeto, não o da variável.",
      },
      {
        id: "q2",
        q: "Métodos com o mesmo nome e parâmetros diferentes na mesma classe são...",
        options: ["Sobrescrita (override)", "Sobrecarga (overload)", "Herança múltipla", "Encapsulamento"],
        answer: 1,
        why: "Overload = parâmetros diferentes, decidido na compilação. Override = mesma assinatura numa subclasse.",
      },
      {
        id: "q3",
        q: "Qual o sinal de que faltou polimorfismo no código?",
        options: ["Muitos métodos pequenos", "Uma cadeia de if (x instanceof A) ... else if (x instanceof B)", "Usar interfaces", "Usar List em vez de array"],
        answer: 1,
        why: "Cada tipo deveria saber fazer a sua parte; o if por tipo vira um método sobrescrito.",
      },
    ],
    challenge: {
      title: "Desafio: zoológico de Formas 🔺",
      brief: "Calcule a área total de uma lista de formas sem nenhum if.",
      steps: [
        { id: "c1", text: "Classe mãe Forma com método area()" },
        { id: "c2", text: "Circulo e Retangulo sobrescrevendo area()" },
        { id: "c3", text: "Uma List<Forma> com as duas misturadas" },
        { id: "c4", text: "Some as áreas num for, sem instanceof" },
        { id: "c5", text: "Bônus: adicione Triangulo sem mexer no loop" },
      ],
    },
  },
  {
    id: "abstracao",
    emoji: "🧩",
    name: "Abstração e Interfaces",
    tagline: "o contrato antes do código",
    lesson: [
      {
        p: "Abstração é mostrar só o que importa e esconder o resto. Você dirige um carro pelo volante e pedais sem saber como o motor funciona. Em Java isso aparece de dois jeitos: classes abstratas e interfaces.",
      },
      {
        code: `// interface: um contrato, "sabe fazer"
public interface Pagavel {
    double valor();
}

// classe abstrata: um molde incompleto, não dá pra fazer new
public abstract class Forma {
    public abstract double area();   // sem corpo, a filha é obrigada a escrever

    public String descricao() {      // pode ter código pronto
        return "forma com área " + area();
    }
}

public class Circulo extends Forma implements Pagavel { ... }`,
      },
      {
        p: "Classe abstrata: pode ter atributos, construtor e métodos prontos; uma classe só estende uma. Use quando as filhas compartilham código (\"é um\"). Interface: define o que a classe sabe fazer; uma classe pode implementar várias. Use para capacidades (Comparable, Pagavel, Voador).",
      },
      {
        tip: "Na entrevista: \"classe abstrata vs interface\" é a pergunta de POO mais comum para estágio. Lembre de citar herança simples vs múltiplas interfaces, e que desde o Java 8 interfaces podem ter métodos default.",
      },
    ],
    tasks: [
      { id: "apostila-abstratas", kind: "ler", title: "Apostila Caelum: Classes abstratas", url: apostila("classes-abstratas"), xp: 20 },
      { id: "apostila-interfaces", kind: "ler", title: "Apostila Caelum: Interfaces", url: apostila("interfaces"), xp: 20 },
      { id: "video", kind: "assistir", title: "Vídeo: classe abstrata vs interface", url: yt("classe abstrata vs interface java diferença"), xp: 10 },
      { id: "lc-minstack", kind: "praticar", title: "LeetCode 155: Min Stack (médio, mas clássico)", url: leetcodeUrl("min-stack"), xp: 20 },
    ],
    quiz: [
      {
        id: "q1",
        q: "Dá para fazer new Forma() se Forma é abstract?",
        options: ["Sim", "Não, classes abstratas não podem ser instanciadas", "Só dentro do pacote", "Só se ela não tiver métodos abstratos"],
        answer: 1,
        why: "Classe abstrata é um molde incompleto: você instancia as filhas concretas.",
      },
      {
        id: "q2",
        q: "Uma classe Java pode implementar quantas interfaces?",
        options: ["Nenhuma", "Só uma", "Várias", "No máximo duas"],
        answer: 2,
        why: "class Pato implements Voador, Nadador é permitido. Estender, só uma classe.",
      },
      {
        id: "q3",
        q: "Quando uma classe abstrata faz mais sentido que uma interface?",
        options: ["Quando as filhas compartilham atributos e código pronto", "Quando você quer herança múltipla", "Nunca", "Quando não tem nenhum método"],
        answer: 0,
        why: "Interface é para \"sabe fazer\"; classe abstrata é para uma família que divide implementação.",
      },
      {
        id: "q4",
        q: "Um método abstract...",
        options: ["Tem corpo vazio {}", "Não tem corpo e obriga as subclasses concretas a implementá-lo", "É sempre static", "Só pode existir em interfaces"],
        answer: 1,
        why: "public abstract double area(); termina em ponto e vírgula, sem chaves.",
      },
    ],
    challenge: {
      title: "Desafio: sistema de pagamentos 💳",
      brief: "Uma loja que aceita formas de pagamento diferentes pelo mesmo contrato.",
      steps: [
        { id: "c1", text: "Interface MeioDePagamento com pagar(double valor)" },
        { id: "c2", text: "Pix, CartaoDeCredito e Boleto implementando a interface" },
        { id: "c3", text: "Cartão cobra juros, Pix dá desconto" },
        { id: "c4", text: "Uma classe Loja que recebe qualquer MeioDePagamento no checkout" },
      ],
    },
  },
  {
    id: "composicao",
    emoji: "🤝",
    name: "Composição e UML",
    tagline: "tem um > é um",
    lesson: [
      {
        p: "Composição é montar um objeto a partir de outros: um Carro tem um Motor. Em vez de herdar comportamento, o objeto guarda outro objeto e delega o trabalho para ele. É mais flexível: dá para trocar a peça (um MotorEletrico) sem mexer na hierarquia.",
      },
      {
        code: `public class Carro {
    private final Motor motor;   // Carro TEM UM Motor

    public Carro(Motor motor) { this.motor = motor; }

    public void ligar() {
        motor.ligar();           // delega
    }
}

new Carro(new MotorGasolina());
new Carro(new MotorEletrico());  // troca sem herança nova`,
      },
      {
        p: "Os relacionamentos que aparecem num diagrama de classes UML: associação (um usa o outro: Aluno — Curso), agregação (tem, mas a parte vive sozinha: Time ◇— Jogador), composição (tem, e a parte morre com o todo: Pedido ◆— ItemDoPedido), herança (seta com triângulo vazio) e implementação de interface (seta tracejada).",
      },
      {
        tip: "Na entrevista: se pedirem para modelar algo (biblioteca, estacionamento), comece listando os substantivos (viram classes) e os verbos (viram métodos), depois desenhe quem tem quem.",
      },
    ],
    tasks: [
      { id: "cev-07a", kind: "assistir", title: "Curso em Vídeo #07a: Relacionamento entre classes", url: cev("GLHbxDU9iBA"), xp: 15 },
      { id: "cev-07b", kind: "assistir", title: "Curso em Vídeo #07b: Objetos compostos em Java", url: cev("BfrbCQ3XcrA"), xp: 15 },
      { id: "cev-08a", kind: "assistir", title: "Curso em Vídeo #08a: Relacionamento de agregação", url: cev("ERdvijGtrq0"), xp: 15 },
      { id: "cev-08b", kind: "assistir", title: "Curso em Vídeo #08b: Agregação entre objetos em Java", url: cev("8R9RpqpXI_c"), xp: 15 },
      { id: "lc-browser", kind: "praticar", title: "LeetCode 1472: Design Browser History", url: leetcodeUrl("design-browser-history"), xp: 20 },
    ],
    quiz: [
      {
        id: "q1",
        q: "Carro e Motor: qual relação?",
        options: ["Carro extends Motor", "Motor extends Carro", "Composição: Carro tem um Motor", "Nenhuma"],
        answer: 2,
        why: "Carro não é um motor. Teste do \"é um\" falhou, use \"tem um\".",
      },
      {
        id: "q2",
        q: "Pedido e ItemDoPedido (os itens não existem sem o pedido) é...",
        options: ["Agregação", "Composição", "Herança", "Interface"],
        answer: 1,
        why: "Composição: a parte nasce e morre com o todo. Agregação: a parte vive sozinha (jogador sem time).",
      },
      {
        id: "q3",
        q: "Por que \"prefira composição a herança\"?",
        options: ["Herança é proibida em Java", "Composição deixa trocar as partes e acopla menos", "Composição usa menos memória", "Herança não suporta polimorfismo"],
        answer: 1,
        why: "Com composição você troca o comportamento em tempo de execução e evita hierarquias frágeis.",
      },
    ],
    challenge: {
      title: "Desafio: biblioteca da escola 🏫",
      brief: "Modele no papel (ou num site tipo draw.io) e depois em código.",
      steps: [
        { id: "c1", text: "Liste os substantivos: Livro, Membro, Emprestimo, Biblioteca..." },
        { id: "c2", text: "Desenhe o diagrama de classes com quem tem quem" },
        { id: "c3", text: "Biblioteca tem uma lista de Livros (composição/agregação?)" },
        { id: "c4", text: "Emprestimo liga um Membro a um Livro com data de devolução" },
        { id: "c5", text: "Implemente emprestar() e devolver() na Biblioteca" },
      ],
    },
  },
  {
    id: "solid",
    emoji: "🧱",
    name: "SOLID",
    tagline: "cinco regrinhas de ouro",
    lesson: [
      {
        p: "SOLID são cinco princípios para escrever classes fáceis de mudar. Para estágio, saber o que cada letra significa com um exemplo já impressiona muito.",
      },
      {
        p: "S, Single Responsibility: uma classe, um motivo para mudar. Relatorio não deveria calcular, formatar e mandar e-mail. O, Open/Closed: aberta para extensão, fechada para modificação. Novo tipo de forma? Crie uma classe, não edite um switch. L, Liskov Substitution: uma filha tem que poder substituir a mãe sem quebrar nada (o famoso Quadrado extends Retangulo que quebra setLargura). I, Interface Segregation: várias interfaces pequenas em vez de uma gigante. Um Robo não deveria ser obrigado a implementar comer(). D, Dependency Inversion: dependa de abstrações. A Loja recebe um MeioDePagamento, não cria um Pix lá dentro.",
      },
      {
        code: `// ❌ viola o D: a Loja está presa ao Pix
class Loja {
    private Pix pagamento = new Pix();
}

// ✅ depende da interface, recebe por construtor
class Loja {
    private final MeioDePagamento pagamento;
    Loja(MeioDePagamento p) { this.pagamento = p; }
}`,
      },
      {
        tip: "Na entrevista: você já usou SOLID nos mundos anteriores! O desafio de Formas é o O, o de pagamentos é o D. Conte isso: exemplos que você mesma escreveu valem ouro.",
      },
    ],
    tasks: [
      { id: "alura-solid", kind: "ler", title: "Alura: SOLID, o que é e quais os 5 princípios", url: alura("solid"), xp: 20 },
      { id: "video", kind: "assistir", title: "Vídeo: SOLID explicado com exemplos", url: yt("SOLID explicado exemplos java"), xp: 10 },
      { id: "video-liskov", kind: "assistir", title: "Vídeo: Liskov e o quadrado/retângulo", url: yt("princípio de liskov quadrado retangulo"), xp: 10 },
    ],
    quiz: [
      {
        id: "q1",
        q: "Uma classe Usuario que valida senha, salva no banco e manda e-mail viola...",
        options: ["Single Responsibility", "Liskov", "Interface Segregation", "Nenhum"],
        answer: 0,
        why: "Três motivos para mudar = três responsabilidades. Separe em classes.",
      },
      {
        id: "q2",
        q: "Para adicionar um novo tipo de desconto você precisa editar um switch gigante. Qual princípio está sendo violado?",
        options: ["Open/Closed", "Dependency Inversion", "Single Responsibility", "Liskov"],
        answer: 0,
        why: "O código deveria ser estendido (nova classe Desconto) sem modificar o que já funciona.",
      },
      {
        id: "q3",
        q: "Uma interface Trabalhador com trabalhar() e comer() obriga Robo a implementar comer(). Qual a solução?",
        options: ["Robo lança exceção em comer()", "Separar em Trabalhador e Comedor", "Herança múltipla", "Deixar comer() vazio e torcer"],
        answer: 1,
        why: "Interface Segregation: interfaces pequenas, cada classe implementa só o que faz sentido.",
      },
      {
        id: "q4",
        q: "O \"D\" de SOLID diz para...",
        options: ["Duplicar código quando necessário", "Depender de abstrações, não de classes concretas", "Documentar tudo", "Deletar código morto"],
        answer: 1,
        why: "Receber uma interface (injeção de dependência) deixa trocar a implementação e testar fácil.",
      },
    ],
    challenge: {
      title: "Desafio: refatora comigo 🧹",
      brief: "Pegue um código seu antigo (de faculdade, de outro desafio) e aplique SOLID.",
      steps: [
        { id: "c1", text: "Ache uma classe que faz coisas demais e quebre em duas" },
        { id: "c2", text: "Troque um if/switch por tipo por polimorfismo" },
        { id: "c3", text: "Faça uma classe receber uma interface no construtor em vez de dar new" },
        { id: "c4", text: "Explique em voz alta qual letra você aplicou em cada passo" },
      ],
    },
  },
  {
    id: "padroes",
    emoji: "🎨",
    name: "Padrões de Projeto",
    tagline: "receitas que todo mundo conhece",
    lesson: [
      {
        p: "Padrões de projeto (design patterns) são soluções com nome para problemas que aparecem sempre. Ninguém espera que uma estagiária saiba os 23 do livro do GoF, mas saber 4 ou 5 com exemplo é um diferencial e tanto.",
      },
      {
        p: "Singleton: uma classe com uma única instância (ex: configuração). Cuidado: é quase um global, então critique ele também. Factory: um método que decide qual classe criar (FormaFactory.criar(\"circulo\")). Strategy: troca o algoritmo em tempo de execução por composição (os meios de pagamento!). Observer: quando algo muda, avisa quem está inscrito (botão com listeners, notificações). Adapter: faz uma interface incompatível encaixar na que você espera (tomada de três pinos).",
      },
      {
        code: `// Strategy: o frete é escolhido em tempo de execução
interface Frete { double calcular(double peso); }
class Sedex implements Frete { public double calcular(double p) { return 20 + p * 2; } }
class Pac   implements Frete { public double calcular(double p) { return 10 + p; } }

class Pedido {
    private Frete frete;
    void setFrete(Frete f) { this.frete = f; }
    double total(double peso) { return frete.calcular(peso); }
}`,
      },
      {
        tip: "Na entrevista: Strategy e Observer são os mais fáceis de explicar com exemplo do dia a dia. O Refactoring.Guru tem tudo em português, com desenhos fofos.",
      },
    ],
    tasks: [
      { id: "alura-patterns", kind: "ler", title: "Alura: Design Patterns, o guia", url: alura("design-patterns-introducao-padroes-projeto"), xp: 10 },
      { id: "guru", kind: "ler", title: "Refactoring.Guru: o que são padrões de projeto", url: "https://refactoring.guru/pt-br/design-patterns/what-is-pattern", xp: 10 },
      { id: "singleton", kind: "ler", title: "Refactoring.Guru: Singleton", url: guru("singleton"), xp: 10 },
      { id: "factory", kind: "ler", title: "Refactoring.Guru: Factory Method", url: guru("factory-method"), xp: 10 },
      { id: "strategy", kind: "ler", title: "Refactoring.Guru: Strategy", url: guru("strategy"), xp: 10 },
      { id: "observer", kind: "ler", title: "Refactoring.Guru: Observer", url: guru("observer"), xp: 10 },
      { id: "adapter", kind: "ler", title: "Refactoring.Guru: Adapter", url: guru("adapter"), xp: 10 },
    ],
    quiz: [
      {
        id: "q1",
        q: "Um app de mapas que deixa escolher rota a pé, de carro ou de bicicleta usa qual padrão?",
        options: ["Singleton", "Strategy", "Adapter", "Observer"],
        answer: 1,
        why: "Cada rota é uma estratégia que implementa a mesma interface e pode ser trocada.",
      },
      {
        id: "q2",
        q: "Um canal do YouTube avisa todos os inscritos quando posta vídeo. Padrão?",
        options: ["Observer", "Factory", "Strategy", "Singleton"],
        answer: 0,
        why: "Os inscritos (observers) se registram no canal (subject) e são notificados.",
      },
      {
        id: "q3",
        q: "Qual a crítica mais comum ao Singleton?",
        options: ["É lento", "Funciona como estado global, dificulta testes e esconde dependências", "Não existe em Java", "Gasta muita memória"],
        answer: 1,
        why: "Saber criticar um padrão mostra maturidade; injeção de dependência costuma ser melhor.",
      },
      {
        id: "q4",
        q: "Você tem uma biblioteca que devolve XML e seu código espera JSON. Qual padrão faz a ponte?",
        options: ["Observer", "Adapter", "Strategy", "Singleton"],
        answer: 1,
        why: "Adapter embrulha a interface incompatível na que o cliente espera.",
      },
    ],
    challenge: {
      title: "Desafio: loja com frete e notificação 📦",
      brief: "Junte dois padrões num programinha só.",
      steps: [
        { id: "c1", text: "Strategy: Frete com Sedex, Pac e RetiradaNaLoja" },
        { id: "c2", text: "Observer: quando o Pedido muda de status, avisa os inscritos" },
        { id: "c3", text: "Inscreva um NotificadorEmail e um NotificadorSms" },
        { id: "c4", text: "Bônus: uma FreteFactory que cria o frete a partir de uma String" },
      ],
    },
  },
  {
    id: "entrevista",
    emoji: "🎤",
    name: "Modo Entrevista",
    tagline: "o chefão final",
    lesson: [
      {
        p: "Agora é juntar tudo. Em entrevista de estágio a POO costuma aparecer de três jeitos: perguntas conceituais (\"quais os 4 pilares?\"), um problema de modelagem (\"desenhe as classes de um estacionamento\") e detalhes de Java (equals/hashCode, == vs equals, exceções, final).",
      },
      {
        p: "Os 4 pilares, que você já domina: Encapsulamento (esconder os dados), Herança (reaproveitar por \"é um\"), Polimorfismo (mesma chamada, comportamentos diferentes) e Abstração (mostrar o essencial, esconder o detalhe).",
      },
      {
        code: `String a = new String("oi");
String b = new String("oi");
a == b        // false: compara se é o MESMO objeto (referência)
a.equals(b)   // true: compara o CONTEÚDO

// se você sobrescreve equals, sobrescreva hashCode também,
// senão HashMap e HashSet se perdem com os seus objetos`,
      },
      {
        tip: "Na modelagem: pense alto! Pergunte os requisitos (quantos andares? tipos de vaga?), liste as classes, comece simples e evolua. O entrevistador quer ver o raciocínio, não o diagrama perfeito.",
      },
    ],
    tasks: [
      { id: "cev-09", kind: "assistir", title: "Curso em Vídeo #09: Exercícios de POO", url: cev("TaqBuubOBgI"), xp: 15 },
      { id: "cev-14b", kind: "assistir", title: "Curso em Vídeo #14b e #15b: Projeto final em Java", url: cev("_5ZUatkzRsM"), xp: 20 },
      { id: "apostila-object", kind: "ler", title: "Apostila Caelum: java.lang.Object, equals e toString", url: apostila("o-pacote-java-lang") + "#metodos-do-javalangobject-equals-e-tostring", xp: 15 },
      { id: "video-perguntas", kind: "assistir", title: "Vídeo: perguntas de entrevista de POO", url: yt("perguntas entrevista estágio programação orientada a objetos"), xp: 10 },
      { id: "lc-queue", kind: "praticar", title: "LeetCode 232: Implement Queue using Stacks", url: leetcodeUrl("implement-queue-using-stacks"), xp: 20 },
      { id: "lc-hashmap", kind: "praticar", title: "LeetCode 706: Design HashMap", url: leetcodeUrl("design-hashmap"), xp: 20 },
      { id: "lc-underground", kind: "praticar", title: "LeetCode 1396: Design Underground System", url: leetcodeUrl("design-underground-system"), xp: 25 },
      { id: "lc-lru", kind: "praticar", title: "LeetCode 146: LRU Cache (o chefão secreto)", url: leetcodeUrl("lru-cache"), xp: 30 },
    ],
    quiz: [
      {
        id: "q1",
        q: "Quais são os 4 pilares da POO?",
        options: [
          "Classes, objetos, métodos e atributos",
          "Encapsulamento, herança, polimorfismo e abstração",
          "SOLID, DRY, KISS e YAGNI",
          "Public, private, protected e static",
        ],
        answer: 1,
        why: "Decore com um exemplo para cada um e você nunca mais trava nessa.",
      },
      {
        id: "q2",
        q: "Para comparar o conteúdo de duas Strings em Java você usa...",
        options: ["==", ".equals()", "===", "compareTo == 1"],
        answer: 1,
        why: "== compara referências (se é o mesmo objeto na memória).",
      },
      {
        id: "q3",
        q: "Sobrescreveu equals mas esqueceu hashCode. O que pode acontecer?",
        options: ["Nada", "Não compila", "Dois objetos \"iguais\" viram entradas diferentes num HashSet/HashMap", "O programa fica mais rápido"],
        answer: 2,
        why: "O contrato: objetos iguais por equals precisam ter o mesmo hashCode.",
      },
      {
        id: "q4",
        q: "O que final faz numa classe, num método e num atributo?",
        options: [
          "Deixa tudo público",
          "Classe: não pode ser herdada. Método: não pode ser sobrescrito. Atributo: não pode ser reatribuído",
          "Apaga o objeto no fim do programa",
          "Torna tudo static",
        ],
        answer: 1,
        why: "String é final, por exemplo: ninguém pode estender String.",
      },
      {
        id: "q5",
        q: "Pediram para modelar um estacionamento. Qual o melhor primeiro passo?",
        options: ["Começar a programar o main", "Fazer perguntas sobre os requisitos e listar as entidades", "Escolher o banco de dados", "Falar que não sabe"],
        answer: 1,
        why: "Esclarecer requisitos (tipos de veículo, andares, pagamento) mostra maturidade e guia o design.",
      },
    ],
    challenge: {
      title: "Chefão: o estacionamento 🚗",
      brief: "O problema de modelagem mais clássico de entrevista. Faça em ~40 min, falando em voz alta como se tivesse alguém te ouvindo.",
      steps: [
        { id: "c1", text: "Escreva 3 perguntas que você faria ao entrevistador" },
        { id: "c2", text: "Classes: Estacionamento, Andar, Vaga, Veiculo, Ticket" },
        { id: "c3", text: "Veiculo abstrato com Carro, Moto e Caminhao" },
        { id: "c4", text: "Vaga sabe se cabe um veículo (polimorfismo!)" },
        { id: "c5", text: "estacionar() devolve um Ticket; sair(ticket) calcula o preço" },
        { id: "c6", text: "Preço como Strategy (por hora, diária)" },
        { id: "c7", text: "Explique para alguém (ou para o espelho) em 5 minutos" },
      ],
    },
  },
];

export const oopKey = (w: OopWorld, itemId: string) => `oop:${w.id}:${itemId}`;

export const worldXpTotal = (w: OopWorld) =>
  w.tasks.reduce((n, t) => n + t.xp, 0) + w.quiz.length * XP.quiz + w.challenge.steps.length * XP.step;

export const oopXpTotal = oopWorlds.reduce((n, w) => n + worldXpTotal(w), 0);

// cute level ladder; minXp is the cumulative threshold
export const oopLevels = [
  { minXp: 0, emoji: "🥚", name: "Ovinho" },
  { minXp: 60, emoji: "🐣", name: "Pintinho Curioso" },
  { minXp: 160, emoji: "🐥", name: "Instanciadora de Objetos" },
  { minXp: 300, emoji: "🦋", name: "Encapsuladora Oficial" },
  { minXp: 480, emoji: "🦄", name: "Polimorfa Mágica" },
  { minXp: 700, emoji: "🧙‍♀️", name: "Feiticeira do SOLID" },
  { minXp: 950, emoji: "👑", name: "Rainha dos Padrões" },
  { minXp: 1250, emoji: "🌟", name: "Estagiária Lendária" },
];
