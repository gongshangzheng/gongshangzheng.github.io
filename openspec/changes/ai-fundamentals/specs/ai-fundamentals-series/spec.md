## Purpose

为AI基础系列提供可审阅的内容与发布契约，使读者能够先理解任务与方法背景，再学习数学基础并在训练篇系统理解数据集、学习与评估，随后学习CNN、注意力及Transformer和各类训练阶段，并确保每篇正文始终以用户参与形成的草稿和已确认的设计为依据。

## ADDED Requirements

### Requirement: Draft and design approval precede article writing

The series MUST have an OpenSpec change before article writing. Each article MUST have a substantive source draft, a linked chapter design, and explicit user approval before publication writing begins.

#### Scenario: Only topic placeholders exist
- **WHEN** the change has only a candidate article list and placeholder drafts
- **THEN** the work remains in planning and no article body is written to src/pages

### Requirement: Modern foundations determine content scope

The series SHALL present eight articles in this order: machine-learning introduction, mathematical foundations, neural-network training, CNN, attention and Transformer, pre-training/fine-tuning/distillation, reinforcement learning, and large language models. The mathematical article MUST include probability, Bayes' theorem, Markov chains, sampling, and Monte Carlo estimation. Training MUST explain loss functions and backpropagation. The machine-learning introduction MUST cover history, learning paradigms and task types, linear and kernel methods, ensembles and random forests, and clustering. CNN MUST include activation functions and mathematical principles within a complete model introduction.

#### Scenario: User reviews series coverage
- **WHEN** the candidate series and later drafts are presented
- **THEN** the eight-article order, dedicated machine-learning introduction, CNN activation/mathematics coverage, and combined attention/Transformer article are identifiable

### Requirement: Mathematical explanations remain traceable and understandable

Each article MUST define its notation, explain the purpose of each derivation, and use concrete worked examples and relevant diagrams. Paper-specific claims and figures MUST cite checked original sources; unknown source coverage MUST be recorded explicitly.

#### Scenario: A formula or original figure is used
- **WHEN** an article introduces a derivation or a source figure
- **THEN** the reader can identify the symbols, understand what the result explains, and locate its reference at the end of the article

### Requirement: Series navigation preserves existing content

Published series pages SHALL be discoverable through the AI基础 category and a linked series navigation page. The user has approved replacing the old machine-learning course articles: substantive explanations, formulas, examples, figures, and source references MUST be accounted for in a migration map and absorbed as fully as possible before the old course pages are deleted. Incoming links MUST be updated; source PDFs and shared assets MUST be preserved. Other legacy notes MAY be retired after complete coverage is verified under the user-approved consolidation policy; ai-chronicle.html is a newly identified candidate. Standalone CNN, Transformer, and LLM training articles are not currently on the retirement list. Consolidated local notes MUST remain internal provenance rather than reader-facing bibliography entries.

#### Scenario: An existing article supplies material
- **WHEN** CNN, Transformer, course, or training content is reused
- **THEN** the migration map identifies the destination and coverage of course material before deletion; standalone pages remain unless separately authorized

### Requirement: Representative architectures explain concrete problems

The CNN article MUST explain LeNet and AlexNet among representative convolutional models and include a dedicated chapter on pre-Transformer sequence architectures such as RNN and LSTM. It MUST distinguish recurrent architectures from convolutional architectures. The attention/Transformer article MUST include a dedicated applications chapter covering BERT, GPT, and DETR, relating their structures and objectives to their tasks.

#### Scenario: Reader compares model families
- **WHEN** the reader reaches the model and application chapters
- **THEN** the article explains each representative model's problem, structural change, information flow, and limitations using appropriate comparison tables and diagrams rather than only listing model names

### Requirement: Data literacy and generalization are core foundations

The training article MUST explain datasets, samples, features, labels, input and target, data splits, data quality, leakage, generalization, and task-appropriate metrics. The introduction SHALL provide only the brief data context needed to explain tasks and methods, and link to training for systematic coverage. The mathematical article MUST include essential matrix/tensor operations, gradients and the chain rule, entropy, cross-entropy, and KL divergence. The training article MUST explain learning curves, underfitting and overfitting, regularization, validation-based selection, and independent testing.

#### Scenario: Reader evaluates a trained model
- **WHEN** the series explains training success and evaluation
- **THEN** it distinguishes training fit from performance on unseen data, explains the roles of validation and test sets, and connects the metric to the task rather than relying only on training loss

### Requirement: Figure planning follows explanatory purpose

Drafts MUST record candidate figure sources and their teaching purpose. Later chapter designs MUST locate figures against reviewed draft sections, distinguish teaching diagrams from original paper figures, preserve useful animation, and verify source and reuse conditions. Missing figures MUST remain explicit gaps.

#### Scenario: A tutorial supplies a candidate figure
- **WHEN** the series reuses a tutorial diagram or animation
- **THEN** its provenance and explanatory role are recorded without claiming that it is an original paper architecture diagram

### Requirement: LLM article integrates preceding foundations

The large-language-model article SHALL connect token prediction, tokenization and embeddings, training and alignment stages, autoregressive decoding, KV caching, capabilities and limitations, and retrieval/tool use. It MUST link preceding explanations instead of duplicating their complete derivations. Its scope approval MUST NOT substitute for source-draft and chapter-design approval.

#### Scenario: Reader completes the foundations series
- **WHEN** the reader reaches the eighth article
- **THEN** it explains the end-to-end language-model workflow and distinguishes architectural computation, training objectives, decoding, and external tools
