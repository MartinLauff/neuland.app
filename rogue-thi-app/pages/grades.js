import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import ReactPlaceholder from 'react-placeholder'
import Container from 'react-bootstrap/Container'
import ListGroup from 'react-bootstrap/ListGroup'

import styles from '../styles/Exams.module.css'

import AppNavbar from '../components/AppNavbar'
import { callWithSession, NoSessionError } from '../lib/thi-backend/thi-session-handler'
import { getGrades } from '../lib/thi-backend/thi-api-client'

export default function Exams () {
  const router = useRouter()
  const [grades, setGrades] = useState(null)
  const [missingGrades, setMissingGrades] = useState(null)

  useEffect(async () => {
    try {
      const gradeList = await callWithSession(getGrades)

      gradeList.forEach(x => {
        if (x.anrech === '*' && x.note === '') {
          x.note = 'E*'
        }
      })

      const deduplicatedGrades = gradeList
        .filter((x, i) => x.ects || !gradeList.some((y, j) => i !== j && x.titel.trim() === y.titel.trim()))

      const finishedGrades = deduplicatedGrades.filter(x => x.note)
      setGrades(finishedGrades)

      setMissingGrades(
        deduplicatedGrades.filter(x => !finishedGrades.some(y => x.titel.trim() === y.titel.trim()))
      )
    } catch (e) {
      if (e instanceof NoSessionError) {
        router.replace('/login')
      } else {
        console.error(e)
        alert(e)
      }
    }
  }, [])

  return (
    <Container>
      <AppNavbar title="Noten & Fächer" />

      <ListGroup>
        <h4 className={styles.heading}>
          Noten
        </h4>

        <ReactPlaceholder type="text" rows={10} color="#eeeeee" ready={grades}>
          {grades && grades.map((item, idx) =>
            <ListGroup.Item key={idx} className={styles.item}>
              <div className={styles.left}>
                {item.titel} ({item.stg})<br />

                <div className={styles.details}>
                  Note: {item.note.replace('*', ' (angerechnet)')}<br />
                  ECTS: {item.ects || '(keine)'}
                </div>
              </div>
            </ListGroup.Item>
          )}
        </ReactPlaceholder>
      </ListGroup>

      <ListGroup>
        <h4 className={styles.heading}>
          Ausstehende Fächer
        </h4>

        <ReactPlaceholder type="text" rows={10} color="#eeeeee" ready={missingGrades}>
          {missingGrades && missingGrades.map((item, idx) =>
            <ListGroup.Item key={idx} className={styles.item}>
              <div className={styles.left}>
                {item.titel} ({item.stg}) <br />

                <div className={styles.details}>
                  Frist: {item.frist || '(keine)'}<br />
                  ECTS: {item.ects || '(keine)'}
                </div>
              </div>
            </ListGroup.Item>
          )}
        </ReactPlaceholder>
      </ListGroup>
      <br />
    </Container>
  )
}
