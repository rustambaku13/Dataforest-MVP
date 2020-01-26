import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import useProtectedRoute from '../hooks/useProtectedRoute';
import useFlexibleWidth from '../hooks/useFlexibleWidth';
import TopHeader from '../components/TopHeader';
import { FilterContainer, Option, Result } from '../components/FilterResult';
import {
  Input,
  List,
  Select,
  Slider,
  Button,
  Tabs,
  Alert,
  Drawer,
  Form,
  Switch,
  Icon,
  Row,
  Col,
  Modal,
  InputNumber,
  DatePicker,
  Radio
} from 'antd';
import moment from 'moment';
import { getAllTasks, getMyTasks } from '../services/tasks';

const { TextArea } = Input;
const { TabPane } = Tabs;

// Disable days before today
const disabledDate = (current) => current && current < moment().startOf('day');

function Tasks({ allTasks, myTasks }) {
  console.log({ allTasks, myTasks });
  const [category, setCategory] = useState('image');
  const [tab, setTab] = useState('public');
  const [drawer, setDrawer] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useProtectedRoute(auth => !auth);

  function resetFilter() {
    setSearchInput("");
    setCategory('image');
  }

  function applyFilter() { }

  return (
    <>
      <Head>
        <link rel="stylesheet" href="/static/css/tasks.css" />
      </Head>
      <TopHeader />
      <FilterContainer>
        <Option>
          <div>
            <h3>Search</h3>
            <Input
              size="large"
              placeholder="Search"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)} />
          </div>
          <div style={{ marginTop: '3rem' }}>
            <h3>Category</h3>
            <Select
              size="large"
              value={category}
              style={{ width: '100%' }}
              onChange={value => setCategory(value)}>
              <Select.Option value="image">Image</Select.Option>
              <Select.Option value="video">Video</Select.Option>
              <Select.Option value="voice">Voice</Select.Option>
              <Select.Option value="data">Data</Select.Option>
              <Select.Option value="sensor">Sensor</Select.Option>
            </Select>
          </div>
          <div style={{ marginTop: '3rem' }}>
            <h3>Tags</h3>
            <Select
              placeholder="Select some options"
              mode="multiple"
              size="large"
              style={{ width: '100%' }}>
              <Select.Option value="animals">Animals</Select.Option>
              <Select.Option value="fauna">Fauna</Select.Option>
            </Select>
          </div>
          <div style={{ marginTop: '3rem' }}>
            <h3>Price</h3>
            <Slider range="range" defaultValue={[0, 1]} min={0} max={1.5} step={0.01} />
          </div>
          <div
            style={{
              marginTop: '3rem',
              display: 'flex',
              flexDirection: 'column',
              width: 100
            }}>
            <Button type="primary" size="large" onClick={applyFilter}>APPLY</Button>
            <a onClick={resetFilter}>Clear all filters</a>
          </div>
        </Option>
        <Result>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
            <h3>Search Results</h3>
            <Button onClick={() => setDrawer(true)} type="primary" size="large">CREATE TASK</Button>
          </div>
          <Tabs activeKey={tab} onChange={key => setTab(key)}>
            <TabPane tab="PUBLIC TASKS" key="public">
              {
                !allTasks.length ? <Alert message="No data has been found!" type="warning" />
                  : (
                    <div className="task-box">
                      {allTasks.map((task, i) => <TaskItem task={task} key={`allTask-${i}`} />)}
                    </div>
                  )
              }
            </TabPane>
            <TabPane tab="MY TASKS" key="my">
              {
                !myTasks.length ? <Alert message="No data has been found!" type="warning" />
                  : (
                    <div className="task-box">
                      {myTasks.map((task, i) => <TaskItem task={task} key={`myTask-${i}`} />)}
                    </div>
                  )
              }
            </TabPane>
          </Tabs>
        </Result>
      </FilterContainer>
      <CreateTaskDrawer
        isDrawerOpen={drawer}
        setIsDrawerOpen={setDrawer}
      />
    </>
  )
}

const CreateTaskDrawer = Form.create()(function (props) {
  const { form, isDrawerOpen, setIsDrawerOpen } = props;

  const [modal, setModal] = useState(false);
  const [labels, setLabels] = useState([]);
  const [labelsDrawer, setLabelsDrawer] = useState(false);
  const drawerWidth = useFlexibleWidth(720);

  const {
    getFieldDecorator,
    validateFields,
    getFieldValue,
    resetFields,
  } = form;

  function addLabel() {
    validateFields(['newLabelName', 'newLabelDesc', 'newLabelType', 'newLabelHas', 'newLabelAnnotation'])
      .then(() => {
        setLabels(prev => [
          ...prev,
          {
            name: getFieldValue("newLabelName"),
            description: getFieldValue("newLabelDesc"),
            label_type: getFieldValue("newLabelType")
          }
        ]);
        setModal(false);
        resetFields(['newLabelName', 'newLabelDesc', 'newLabelType', 'newLabelHas', 'newLabelAnnotation']);
      });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    form.validateFields();

    setIsDrawerOpen(false);
  }

  return (
    <Drawer
      title="Create a new Task"
      width={drawerWidth}
      onClose={() => setIsDrawerOpen(false)}
      visible={isDrawerOpen}
      bodyStyle={{ paddingBottom: 80 }}>

      <Form onSubmit={handleSubmit} layout="vertical">
        <Drawer
          title="Define Labels"
          width="50%"
          visible={labelsDrawer}
          bodyStyle={{ paddingBottom: 80 }}
          onClose={() => setLabelsDrawer(false)}>
          <Modal
            visible={modal}
            closable={true}
            onCancel={() => setModal(false)}
            title="Add New Label"
            footer={[
              <Button key="submit" onClick={addLabel} type="primary">
                Add
              </Button>
            ]}
          >
            <Row>
              <Col span={24}>
                <Form.Item label="Name of label">
                  {
                    getFieldDecorator('newLabelName', {
                      rules: [
                        {
                          required: true,
                          message: 'Please select Name of Label'
                        }
                      ]
                    })(<Input maxLength={50} />)
                  }
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Description of label">
                  {
                    getFieldDecorator('newLabelDesc')(
                      <TextArea autoSize={{ minRows: 2, maxRows: 8 }} />
                    )
                  }
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="Type of label">
                  {
                    getFieldDecorator('newLabelType', {
                      rules: [
                        {
                          required: true,
                          message: 'Please select Type of Label'
                        }
                      ]
                    })(
                      <Select style={{ width: '100%' }}>
                        <Option value="integer">Integer Label</Option>
                        <Option value="decimal">Decimal Label</Option>
                        <Option value="boolean">Boolean Label</Option>
                        <Option value="date">Date Label</Option>
                        <Option value="text">Text Label</Option>
                        <Option value="file">File Label</Option>
                      </Select>
                    )
                  }
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={10}>
                <Form.Item label="Has Annotation">
                  {
                    getFieldDecorator('newLabelHas', {
                      initialValue: false,
                      valuePropName: 'checked'
                    })(<Switch />)
                  }
                </Form.Item>
              </Col>
              <Col span={14}>
                <Form.Item label="Annotation Type" style={{ display: getFieldValue("newLabelHas") ? "initial" : "none" }}>
                  {
                    getFieldDecorator('newLabelAnnotation', {
                      rules: [
                        {
                          required: getFieldValue("newLabelHas"),
                          message: "Chose the Type of annotation"
                        }
                      ],
                    })(
                      <Select style={{ width: "100%" }}>
                        <Option value="ln">Line Annotation</Option>
                        <Option value="rec">Rectangular Annotation</Option>
                        <Option value="px">Point Annotation</Option>
                      </Select>
                    )
                  }
                </Form.Item>
              </Col>
            </Row>
          </Modal>
          <Row>
            <Col span={24}>
              <Button onClick={() => setModal(true)}
                type="dashed"
                style={{ width: '100%' }}>
                <Icon type="plus" />Add field
              </Button>
            </Col>
            <Col span={24}>
              <List
                dataSource={labels}
                renderItem={item => (
                  <List.Item key={item.name} >
                    <List.Item.Meta title={item.name} description={item.description} />
                    {item.label_type}
                  </List.Item>
                )}
              />
            </Col>
          </Row>
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e9e9e9',
              padding: '10px 16px',
              background: '#fff',
              textAlign: 'right'
            }}>
            <Button style={{ marginRight: 8 }} onClick={() => setLabelsDrawer(false)}>
              Back
            </Button>
            <Button
              htmlType="submit"
              type="primary">
              Submit Task
            </Button>
          </div>
        </Drawer>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Type of Order">
              {
                getFieldDecorator('task_type', {
                  rules: [
                    {
                      required: true,
                      message: 'Please select Type of Order'
                    }
                  ],
                  initialValue: "image"
                })(
                  <Radio.Group buttonStyle="solid">
                    <Radio.Button value="image">Image</Radio.Button>
                    <Radio.Button value="video">
                      Video
                    </Radio.Button>
                    <Radio.Button disabled="disabled" value="audio">Audio</Radio.Button>
                    <Radio.Button disabled="disabled" value="statistics">Statistics</Radio.Button>
                  </Radio.Group>
                )
              }
            </Form.Item>

          </Col>
          <Col span={24}>
            <Form.Item label="Title">
              {
                getFieldDecorator('title', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your Title'
                    }
                  ]
                })(<Input size="large" placeholder="Street Images" />)
              }
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Description">
              {
                getFieldDecorator('description')(
                  <TextArea
                    autoSize={{ minRows: 5, maxRows: 8 }}
                    placeholder="Detailed explanation ... " />
                )
              }
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Price">
              {
                getFieldDecorator('price', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your Price'
                    }
                  ]
                })(
                  <InputNumber
                    min={0}
                    placeholder="200"
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    size="large"
                    style={{ width: "100%" }}
                  />
                )
              }
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Dealine">
              {
                getFieldDecorator('deadline', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your Deadline'
                    }
                  ]
                })(
                  <DatePicker
                    disabledDate={disabledDate}
                    style={{ width: "100%" }}
                    size="large"
                  />
                )
              }
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Quantity">
              {
                getFieldDecorator('quantity', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your Quantity'
                    }
                  ]
                })(
                  <InputNumber
                    style={{ width: "100%" }}
                    min="0"
                    size="large" />
                )
              }
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Tags">
              {
                getFieldDecorator('tags')(
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="Tags Mode">
                    <Option key="animals">Animals</Option>
                    <Option key="fauna">Fauna</Option>
                    <Option key="people">People</Option>
                  </Select>,
                )
              }
            </Form.Item>
          </Col>
          <Col span={24}>
            <Tabs
              tabBarStyle={{ display: "none" }}
              hideAdd="true"
              activeKey={getFieldValue("task_type")}>
              <TabPane key="image">
                <Col span={6}>
                  <Form.Item label="Extension">
                    {
                      getFieldDecorator("extension", {
                        rules: [
                          {
                            required: getFieldValue("task_type") === "image",
                            message: 'Please input your Image Extension'
                          }
                        ]
                      })(
                        <Select>
                          <Option value="JPEG">JPEG</Option>
                          <Option value="PNG">PNG</Option>
                          <Option value="TIFF">TIFF</Option>
                        </Select>
                      )
                    }
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Height">
                    {
                      getFieldDecorator("height", {
                        rules: [
                          {
                            required: true,
                            message: 'Please input your Image Height'
                          }
                        ],
                        placeholder: 200
                      })(
                        <InputNumber
                          placeholder="px"
                          style={{ width: "100%" }}
                          min="0" />
                      )
                    }
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Width">
                    {
                      getFieldDecorator("width", {
                        rules: [
                          {
                            required: true,
                            message: 'Please input your Image Width'
                          }
                        ],
                        placeholder: 200
                      })(
                        <InputNumber
                          placeholder="px"
                          style={{ width: "100%" }}
                          min="0" />
                      )
                    }
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Type">
                    {
                      getFieldDecorator("image_type", {
                        rules: [
                          {
                            required: true,
                            message: 'Please input your Image Type'
                          }
                        ],
                        placeholder: 200
                      })(
                        <Select>
                          <Option value="RGBA">RGBA</Option>
                          <Option value="RGB">RGB</Option>
                          <Option value="Grayscale">Grayscale</Option>
                        </Select>
                      )
                    }
                  </Form.Item>
                </Col>

              </TabPane>
              <TabPane key="video">
                To be added ...
                                </TabPane>
              <TabPane key="audio">
                To be added ...
                                </TabPane>
              <TabPane key="statistical">
                To be added ...
                                </TabPane>
            </Tabs>
          </Col>

        </Row>

        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'right'
          }}>
          <Button style={{ marginRight: 8 }} onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              validateFields(['title', 'task_type', 'description', 'price', 'deadline', 'quantity', 'extension', 'height', 'width', 'image_type', 'extension']).then(() => {
                setLabelsDrawer(true);
              })
            }}
            type="primary"
          >Proceed</Button>
        </div>
      </Form>
    </Drawer>
  )
});

function TaskItem({ task }) {
  return (
    <Link href={`/task/${task.id}`}>
      <a>
        <div className="task-details-container">
          <div>
            <h2 className="task-title">{task.title}</h2>
            <ul className="task-icons">
              <li>
                <span className="ti-timer" /> {moment(task.deadline, 'YYYY-MM-DD').format('MMM. DD, YYYY')}
              </li>
            </ul>
            <h6 className="task-description">
              {task.description}
            </h6>
            <div className="task-tags">
              {task.tags.map((tag, i) => <span key={i}>{tag}</span>)}
            </div>
          </div>
        </div>
        <div className="task-pricing-container">
          <div className="task-pricing">
            <div className="task-offers">
              <strong>${task.price_per_datum.toFixed(2)}/datum</strong>
            </div>
          </div>
        </div>
      </a>
    </Link>
  )
}

Tasks.getInitialProps = async () => {
  const allTasks = await getAllTasks();
  const myTasks = await getMyTasks();
  return { allTasks, myTasks };
}

export default Tasks;