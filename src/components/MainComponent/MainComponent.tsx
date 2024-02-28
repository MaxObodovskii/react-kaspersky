import { FC, useState } from "react";
import Papa, { ParseResult } from "papaparse";
import { Upload, Button, Table, Modal, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import styles from "./MainComponent.module.css";

const { Text } = Typography;

interface IData {
  ID: number;
  Text: string;
  SelectedWords: string[];
}

const MainComponent: FC = () => {
  const [data, setData] = useState<IData[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileUpload = (file: File) => {
    if (file.type !== "text/csv") {
      setError("Вы выбрали неправильный файл, это не CSV. Попробуйте еще раз!");

      setTimeout(() => {
        setError("");
      }, 10000);
      
      return;
    }

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      delimiter: ";",
      complete: (results: ParseResult<string[]>) => {
        const formattedData = results.data.map((row, index) => ({
          ID: parseInt(row[0]),
          Text: row[1],
          SelectedWords: [],
        }));
        setData(formattedData);
      },
      error: (error) => {
        console.error("An error occurred while parsing the file:", error);
      },
    });
    setFile(file);
    setError("");
  };

  const handleWordSelection = (id: number, word: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.ID === id
          ? {
              ...item,
              SelectedWords: item.SelectedWords.includes(word)
                ? item.SelectedWords.filter(
                    (selectedWord) => selectedWord !== word
                  )
                : [...item.SelectedWords, word],
            }
          : item
      )
    );
  };

  const handleSave = () => {
    const linesToSave = data
      .filter((item) => item.SelectedWords.length > 0)
      .map((item) => item.SelectedWords.join("|"));

    const blob = new Blob([linesToSave.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "selected_saved_words.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <Modal
        title="Ошибка"
        open={!!error}
        onOk={() => setError("")}
        onCancel={() => setError("")}
        okText="OK"
        closable={false}
      >
        <Text type="danger">{error}</Text>
      </Modal>

      <div className={styles.btnCenter}>
        <Upload
          accept=".csv"
          showUploadList={false}
          beforeUpload={(file) => {
            handleFileUpload(file as File);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Load</Button>
        </Upload>
      </div>

      {file && data.length ? (
        <>
          <Table
            dataSource={data}
            columns={[
              { title: "ID", dataIndex: "ID", key: "ID" },
              {
                title: "Text",
                dataIndex: "Text",
                key: "Text",
                render: (text, record) => (
                  <span>
                    {text.split(" ").map((word: string, index: number) => (
                      <span
                        key={index}
                        style={{
                          cursor: "pointer",
                          color: record.SelectedWords.includes(word)
                            ? "white"
                            : "black",
                          backgroundColor: record.SelectedWords.includes(word)
                            ? "red"
                            : "transparent",
                          borderRadius: "5px",
                          padding: "2px",
                          margin: "3px",
                        }}
                        onClick={() => handleWordSelection(record.ID, word)}
                      >
                        {word}{" "}
                      </span>
                    ))}
                  </span>
                ),
              },
            ]}
            pagination={false}
            rowKey="ID"
          />
          <div className={styles.btnCenter}>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default MainComponent;
