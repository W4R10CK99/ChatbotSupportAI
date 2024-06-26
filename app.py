import streamlit as st
import pandas as pd
import json
import plotly.express as px


# CSS styles
css = """
<style>
.main {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.chart-container {
    width: 49%;
    margin-bottom: 20px;
}

.table-container {
    width: 100%;
    margin-top: 20px;
}

.toggle-table {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
}

.toggle-table button {
    padding: 5px 10px;
    background-color: #f0f0f0;
    border: none;
    cursor: pointer;
}

.toggle-table button.active {
    background-color: #007bff;
    color: #fff;
}
</style>
"""

# Inject CSS styles
st.markdown(css, unsafe_allow_html=True)

with open('broker_stats.json') as f:
    broker_stats = json.load(f)

with open('class_stats.json') as f:
    class_stats = json.load(f)

def calculate_diff_percentage(actual, planned):
    diff = actual - planned
    percentage = (diff / planned) * 100
    return round(percentage, 2)

def create_broker_chart(year, market_type):
    filtered_brokers = [broker for broker in broker_stats if broker['Year'] == year and broker['Market Type'] == market_type]
    sorted_brokers = sorted(filtered_brokers, key=lambda x: x['GWP'], reverse=True)[:10]
    df = pd.DataFrame(sorted_brokers)
    df['Diff %'] = df.apply(lambda row: calculate_diff_percentage(row['GWP'], row['Planned GWP']), axis=1)
    fig = px.bar(df, x='Broker Name', y=['GWP', 'Planned GWP'], barmode='group', title='Broker Performance')
    return fig

def create_class_chart(year, class_of_business):
    filtered_classes = [cls for cls in class_stats if cls['Year'] == year and cls['Class of Business'] == class_of_business]
    df = pd.DataFrame(filtered_classes)
    fig = px.bar(df, x='ClassType', y=['Business Plan', 'Earned Premium', 'GWP '], barmode='group', title='Business Class Analysis')
    return fig

# st.set_page_config(page_title='Interactive Dashboard')

st.title('LeadenHall Analytics')

years = sorted(set([broker['Year'] for broker in broker_stats]))
selected_year = st.selectbox('Select Year', years)

market_type = 'Open Market'
class_of_business = 'Financial Institution'

st.markdown('<div class="main">', unsafe_allow_html=True)

# Broker Performance
st.markdown('<div class="chart-container">', unsafe_allow_html=True)
st.subheader('Brokers Performance')
broker_chart = create_broker_chart(selected_year, market_type)
st.plotly_chart(broker_chart)
st.markdown('</div>', unsafe_allow_html=True)

# Business Class Analysis
st.markdown('<div class="chart-container">', unsafe_allow_html=True)
st.subheader('Business Class Analysis')
class_chart = create_class_chart(selected_year, class_of_business)
st.plotly_chart(class_chart)
st.markdown('</div>', unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)

# Broker Table
show_broker_table = st.checkbox('Show Top 10 Brokers Table')
if show_broker_table:
    st.markdown('<div class="table-container">', unsafe_allow_html=True)
    st.subheader('Top 10 Brokers')
    filtered_brokers = [broker for broker in broker_stats if broker['Year'] == selected_year and broker['Market Type'] == market_type]
    sorted_brokers = sorted(filtered_brokers, key=lambda x: x['GWP'], reverse=True)[:10]
    df = pd.DataFrame(sorted_brokers)
    df['Diff %'] = df.apply(lambda row: calculate_diff_percentage(row['GWP'], row['Planned GWP']), axis=1)
    st.dataframe(df[['Broker Name', 'GWP', 'Planned GWP', 'Diff %']])
    st.markdown('</div>', unsafe_allow_html=True)

# Class Table
show_class_table = st.checkbox('Show Class Details Table')
if show_class_table:
    st.markdown('<div class="table-container">', unsafe_allow_html=True)
    st.subheader('Class Details')
    filtered_classes = [cls for cls in class_stats if cls['Year'] == selected_year and cls['Class of Business'] == class_of_business]
    df = pd.DataFrame(filtered_classes)
    st.dataframe(df[['Class of Business', 'ClassType', 'Business Plan', 'Earned Premium', 'GWP ']])
    st.markdown('</div>', unsafe_allow_html=True)