import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Services() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-left font-mono">
      <Helmet>
        <title>Services | Data Engine AI</title>
        <meta name="description" content="Explore our automated AI data science services including EDA, machine learning generation, Python script synthesis, and Streamlit dashboard generation." />
        <meta name="keywords" content="Services, Machine Learning, Data Analytics, Dashboard Generation, Python Scripting, AI Pipeline" />
      </Helmet>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-foreground mb-8 border-l-4 border-primary pl-4">Platform Services</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-4">Automated Machine Learning (AutoML)</h2>
          <p className="mb-4">
            Forget manual hyperparameter tuning, model selection algorithms, and extensive data pre-processing pipelines. Our Data Engine provides comprehensive AutoML services that take your structured data and immediately analyze it for predictability. The system automatically performs one-hot encoding for categorical variables, median imputation for missing data, and StandardScaler normalization for numerical columns.
          </p>
          <p className="mb-4">
            Depending on your specific goals (Classification, Regression, Clustering), the Engine provisions Random Forest Classifiers, Gradient Boosting algorithms (XGBoost/LightGBM), or standard Linear Regression models within seconds. You receive the exact, executable scikit-learn code, complete with Train/Test splitting and evaluated metrics such as F1-Score, RMSE, and Confusion Matrices. By automating this, data scientists can skip the initial 60% of grunt work and move straight to model interpretability and tuning.
          </p>
          <p className="mb-4">
            The models are instantiated locally through the generated Python scripts, meaning you have full transparency. There are no black-box predictions hiding behind a proprietary API. The exported models can be deployed using standard tooling like FastAPI, Docker, or serverless functions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-4">Exploratory Data Analysis (EDA) & Profiling</h2>
          <p className="mb-4">
            Before any model is trained, the data must be understood. Our fully automated EDA microservice generates comprehensive reports about the shape, distribution, and anomalies within your dataset. We utilize LLMs to interpret column names semantically. If a column is named "Cust_Age", the AI knows it's a numeric distribution and will generate code to plot a seaborn histogram with an overlaid KDE.
          </p>
          <p className="mb-4">
            Our pipeline writes code to check for high cardinality, correlation matrices, and time-series seasonality automatically. The generated reports highlight exact statistical phenomena: "Warning: Feature X is 95% correlated with Feature Y, consider dimensionality reduction." This allows you to catch domain-specific errors without writing a line of code. All required libraries like pandas, numpy, seaborn, and matplotlib are perfectly pipelined in the output.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-4">Instant Dashboard Compilation</h2>
          <p className="mb-4">
            Reports in Jupyter Notebooks are great for engineers, but business stakeholders require interactive UIs. Our pinnacle service is the instant distillation of an AI workflow into a fully functional Streamlit web application. We bridge the gap between backend data processing and frontend interactivity.
          </p>
          <p className="mb-4">
             The Streamlit dashboards generated include interactive Plotly or Altair charts, sidebar filtering mechanisms, and reactive state management. When the user sets a requirement like "Make a sales dashboard filtered by region", the LLM correctly maps those requirements into Streamlit st.sidebar elements and integrates them seamlessly with the pandas dataframe logic. The resulting file, dashboard.py, can be immediately deployed to Streamlit Community Cloud or internal enterprise infrastructure using Docker.
          </p>
          <p className="mb-4">
            You maintain 100% ownership of the generated artifacts. Because we generate human-readable, PEP-8 compliant Python code, any mid-level developer can easily take the output and modify it to match internal styling or additional logic constraints. We are not just giving you the answer; we are giving you the meticulously crafted formula.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-4">Multi-Model Agent Workflows</h2>
          <p className="mb-4">
            Not all LLMs are created equal. GPT-4o excels in complex logical reasoning, while Anthropic Claude 3.5 Sonnet might be better at writing pristine React or Python code. Google Gemini 1.5 Pro dominates in high-context tasks such as parsing massive schema dumps.
          </p>
          <p className="mb-4">
            Our service abstracts the complexity of vendor lock-in by providing a unified interface across all major LLMs. Users can select their preferred engine, or let the System autonomously decide which model is best suited for the sub-task. For instance, the planning phase might use GPT-4, while the high-velocity syntactical code writing phase utilizes an optimized open-source model. 
          </p>
          <p className="mb-4">
             We ensure data privacy and provide BYOK (Bring Your Own Key) structures for users who wish to operate entirely inside their own billing cycles and compliance constraints. The entire service suite represents a robust, enterprise-grade AI companion engineered for high-impact analytical work.
          </p>
        </section>
      </div>
    </div>
  );
}
